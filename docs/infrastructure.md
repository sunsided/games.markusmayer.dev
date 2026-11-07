# Infrastructure setup

One-time setup for serving games.markusmayer.dev, runnable from any machine with `gcloud`,
`cf` (Cloudflare's CLI), `gh` and `jq`. It follows what markusmayer.dev already uses, and
reuses the parts that site shares with others:

```
browser ─▶ Cloudflare (proxied DNS, SSL mode Full)
        ─▶ Google HTTPS load balancer, url map `widemeadows-de` (routes by host)
        ─▶ backend bucket `games-markusmayer-dev` with Cloud CDN
        ─▶ bucket gs://games.markusmayer.dev
GitHub Actions (deploy.yml on main) ─▶ Workload Identity Federation ─▶ games-deploy SA
```

New here: the bucket, a backend bucket, a host rule on the existing url map, a deploy
service account, a Workload Identity provider bound to this repository's `main`, the
`production` environment's variables, and one DNS record. Nothing about the other sites
changes.

Run each block in order and read what it prints before the next. Section 1 only reads.

## 0. Tools and variables

```sh
gcloud auth login
gh auth login
npm install --global cf    # Cloudflare's official CLI (open beta since Sep 2026)
cf auth login              # or export CLOUDFLARE_API_TOKEN (Zone:DNS:Edit, Zone:Settings:Read)

export PROJECT=fabled-pivot-392113
export DOMAIN=games.markusmayer.dev
export BUCKET=$DOMAIN
export BACKEND=games-markusmayer-dev
export URL_MAP=widemeadows-de
export REPO=sunsided/games.markusmayer.dev
export SA_NAME=games-deploy
export SA=$SA_NAME@$PROJECT.iam.gserviceaccount.com
export ZONE=markusmayer.dev
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format='value(projectNumber)')
gcloud config set project $PROJECT
```

## 1. Look at what is there (read-only)

```sh
# Where markusmayer.dev's bucket lives, and how its backend bucket is set up: mirror it.
gcloud storage buckets describe gs://markusmayer.dev \
  --format='yaml(location,website,uniform_bucket_level_access)'
gcloud compute backend-buckets list --format='table(name,bucketName,enableCdn,cdnPolicy.cacheMode,cdnPolicy.clientTtl,cdnPolicy.maxTtl)'

# The url map's hosts, and the load balancer's IP (the Cloudflare record points here).
gcloud compute url-maps describe $URL_MAP --format='yaml(hostRules,pathMatchers[].name,pathMatchers[].defaultService)'
gcloud compute forwarding-rules list --global --format='table(name,IPAddress,portRange,target.basename())'

# The Workload Identity pool markusmayer.dev deploys through, and the CDN invalidation role.
gcloud iam workload-identity-pools list --location=global --format='table(name.basename(),state)'
gcloud iam roles list --project=$PROJECT --format='table(name.basename(),title,includedPermissions.list())'
```

Note from the output:

- `LOCATION`: markusmayer.dev's bucket location.
- `LB_IP`, `LB_IP6`: the IPv4 and IPv6 addresses of the HTTPS forwarding rules (port 443).
- `POOL`: the pool id (likely `github`).
- `CDN_ROLE`: the custom role holding `compute.urlMaps.invalidateCache` (likely
  `cdnInvalidator`). If there is none, section 5 creates it.

```sh
export LOCATION=...      # e.g. EUROPE-WEST3, as markusmayer.dev
export LB_IP=...      # IPv4 of the 443 forwarding rule
export LB_IP6=...     # IPv6 of the 443 forwarding rule
export POOL=github
export CDN_ROLE=cdnInvalidator
```

## 2. Bucket

A bucket named after a domain needs the gcloud account to be a verified owner of that
domain in Google Search Console. markusmayer.dev is verified as a domain property, which
covers this subdomain. If the create below fails with "verify site ownership", add the
account as an owner there first.

```sh
gcloud storage buckets create gs://$BUCKET \
  --location=$LOCATION \
  --uniform-bucket-level-access

gcloud storage buckets update gs://$BUCKET \
  --web-main-page-suffix=index.html \
  --web-error-page=404.html

# Public read: it is a website.
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=allUsers --role=roles/storage.objectViewer
```

## 3. Backend bucket with Cloud CDN, and the host rule

The upload sets `Cache-Control` per path (HTML `max-age=0`, hashed assets and builds
`immutable` for a year). `USE_ORIGIN_HEADERS` makes the CDN cache and pass on exactly
that. It takes no TTL flags: `--client-ttl`, `--default-ttl` and `--max-ttl` are refused
in this mode ("max_ttl must be specified with CACHE_ALL_STATIC cache_mode only"). That is
why it differs from markusmayer.dev's backend, which is `CACHE_ALL_STATIC` with year-long
TTLs.

```sh
gcloud compute backend-buckets create $BACKEND \
  --gcs-bucket-name=$BUCKET \
  --enable-cdn \
  --cache-mode=USE_ORIGIN_HEADERS

gcloud compute url-maps add-path-matcher $URL_MAP \
  --path-matcher-name=games \
  --default-backend-bucket=$BACKEND \
  --new-hosts=$DOMAIN

gcloud compute url-maps describe $URL_MAP --format='yaml(hostRules)'
```

The load balancer needs no new certificate. Cloudflare connects in SSL mode _Full_, which
needs TLS but does not check the certificate's name, so the load balancer's existing
certificate is enough. If the zone is ever switched to _Full (strict)_, add a certificate
for `$DOMAIN` to the target HTTPS proxy first.

## 4. Deploy service account

Three grants, as markusmayer.dev's deploy account has: list and write its own bucket, and
drop the CDN's cache. No key is created; GitHub signs in through section 6.

```sh
gcloud iam service-accounts create $SA_NAME \
  --display-name="games.markusmayer.dev deploy (GitHub Actions)"

# A new account takes a few seconds to show up for IAM. Granting it a role at once can fail
# with "Service account ... does not exist"; wait a little and run the grant again.
sleep 30

gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=serviceAccount:$SA --role=roles/storage.objectAdmin
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=serviceAccount:$SA --role=roles/storage.legacyBucketReader
```

## 5. CDN invalidation role

Only if section 1 found no such role:

```sh
gcloud iam roles create $CDN_ROLE --project=$PROJECT \
  --title="CDN invalidator" \
  --permissions=compute.urlMaps.invalidateCache \
  --stage=GA
```

Then grant it. It can only drop caches, and the deploy scopes every invalidation to its
own host:

```sh
gcloud projects add-iam-policy-binding $PROJECT \
  --member=serviceAccount:$SA --role=projects/$PROJECT/roles/$CDN_ROLE \
  --condition=None
```

## 6. Workload Identity provider for this repository

A provider of its own in the existing pool, so markusmayer.dev's provider stays as it is.
It only accepts tokens from this repository's `main`. That is the branch the deploy runs
on, and the only branch a leaked GitHub App key could not reach without passing `ci`.

```sh
gcloud iam workload-identity-pools providers create-oidc games-markusmayer-dev \
  --location=global \
  --workload-identity-pool=$POOL \
  --display-name="games.markusmayer.dev" \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref \
  --attribute-condition="assertion.repository == '$REPO' && assertion.ref == 'refs/heads/main'"

gcloud iam service-accounts add-iam-policy-binding $SA \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"
```

## 7. GitHub: the `production` environment

```sh
gh api -X PUT repos/$REPO/environments/production >/dev/null

gh variable set GCP_WIF_PROVIDER --repo $REPO --env production \
  --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/games-markusmayer-dev"
gh variable set GCP_DEPLOY_SA --repo $REPO --env production --body "$SA"
gh variable set GCS_BUCKET    --repo $REPO --env production --body "$BUCKET"
gh variable set GCP_URL_MAP   --repo $REPO --env production --body "$URL_MAP"
gh variable set GCP_PROJECT   --repo $REPO --env production --body "$PROJECT"

gh variable list --repo $REPO --env production
```

Optionally restrict the environment to `main` (Settings → Environments → production →
Deployment branches). The Workload Identity condition enforces that already.

## 8. Cloudflare: DNS

`cf` is in open beta. If a command below has changed, `cf cli search "<what you want>"`
finds the current one, and `--dry-run` shows the request without sending it.

```sh
export ZONE_ID=$(cf zones list | jq -r --arg z "$ZONE" '.[] | select(.name == $z) | .id')
echo "$ZONE_ID"

# How markusmayer.dev itself is pointed: copy its type and proxied state.
cf dns records list --zone $ZONE_ID | jq -r '.[] | select(.name == "markusmayer.dev" or .name == "www.markusmayer.dev") | [.type, .name, .content, .proxied] | @tsv'
```

markusmayer.dev has an `A` and an `AAAA` record to the load balancer (its IPv4 and IPv6
forwarding rules). Do the same, with `LB_IP6` the address of the IPv6 forwarding rule from
section 1:

```sh
for rec in "A $LB_IP" "AAAA $LB_IP6"; do
  set -- $rec
  cf dns records create --zone $ZONE_ID --dry-run \
    --body "$(jq -nc --arg t "$1" --arg ip "$2" '{type:$t, name:"games", content:$ip, proxied:true, ttl:1, comment:"games.markusmayer.dev → Google LB"}')"
done
# Looks right? Run it again without --dry-run.
```

Create the records last, after section 3: until the host rule exists, the url map's
`*.markusmayer.dev` wildcard would serve markusmayer.dev itself under this name.

If it is a `CNAME` instead, copy its target (`content`) and use
`{type:"CNAME", name:"games", content:"<that target>", proxied:true, ttl:1}`.

The SSL/TLS mode is a zone setting, shared with markusmayer.dev, and must stay **Full**:
_Full (strict)_ rejects the load balancer's certificate name, and _Flexible_ sends the hop to
Google in the clear. Check it, without changing it:

```sh
cf cli search "get zone ssl setting"     # then run the command it names, for setting "ssl"
# Or with the API directly:
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl | jq -r .result.value   # → full
```

Leave Caching → Browser Cache TTL at _Respect Existing Headers_, as for markusmayer.dev.

## 9. First deploy and checks

```sh
gh workflow run deploy.yml --repo $REPO --ref main
gh run watch --repo $REPO $(gh run list --repo $REPO --workflow deploy.yml -L1 --json databaseId -q '.[0].databaseId')

curl -sI https://$DOMAIN/ | grep -iE '^(HTTP|server|cache-control|x-goog-generation)'
curl -sI https://$DOMAIN/builds/cheesed/v0.1.2/cheese_bg.wasm | grep -iE '^(HTTP|content-type|cache-control)'
```

Expect `200`, `server: cloudflare`, HTML with `max-age=0, must-revalidate`, and the wasm
as `application/wasm` with `immutable`. If the HTML is stale after a deploy, the copy is
in Cloud CDN, not Cloudflare (`cf-cache-status: DYNAMIC`). `task deploy:invalidate`
clears it, and the workflow runs it on every deploy.
