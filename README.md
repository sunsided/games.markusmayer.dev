# games.markusmayer.dev

The games corner of [markusmayer.dev](https://markusmayer.dev): a SvelteKit static site
listing the games and playing the browser ones in place. Game repositories announce their
releases here; the site picks them up without anyone editing it.

## How a release gets here

```
game repo: tag v1.2.3 → release.yml builds, attests, publishes release
                      → job `announce` (calls .github/workflows/announce.yml here)
                          mints a GitHub App token, sends repository_dispatch `game-released`
this repo:            → game-released.yml runs scripts/sync-game.ts:
                          · repo must already be in games/*.json   (registry = allowlist)
                          · release must be published, not draft/prerelease, not older
                          · web zip SHA-256 must match the release's SHA256SUMS
                          · `gh attestation verify` against that repo
                          · zip must have index.html at its root
                      → PR `release/<slug>` bumping games/<slug>.json, auto-merge on
                      → ci.yml passes → squash-merge → deploy.yml → bucket + CDN invalidation
```

Re-run any release by hand: Actions → _Game released_ → _Run workflow_, or locally
`task sync -- --repo sunsided/cheesed --tag v0.1.3`.

## The registry

One `games/<slug>.json` per game, shape in [`games/schema.json`](games/schema.json).
Editorial fields (title, tagline, description, tags, order, links) are yours; the bot only
rewrites `release` and `web.sha256`. `{version}` in `web.asset` and in link URLs is filled
with the current tag.

- **Web game**: has `web`. The release asset is a zip whose `index.html` uses relative
  paths (Trunk: `public_url = "./"`). It is self-hosted at `/builds/<slug>/<version>/` and
  framed by `/<slug>/`. Old versions stay in the bucket, immutable.
- **Anything else**: leave out `web`, give `links` (download, store page, itch.io…). It
  gets a card and a page with those links.

## Adding a game

1. Write `games/<slug>.json` here (copy one). Merge it.
2. In the game repository: set variable `GAMES_APP_ID` and secret `GAMES_APP_PRIVATE_KEY`
   (`gh variable set` / `gh secret set`), and add to its release workflow, after the job
   that publishes the release:

   ```yaml
   announce:
     needs: [release]
     uses: sunsided/games.markusmayer.dev/.github/workflows/announce.yml@main
     with:
       app-id: ${{ vars.GAMES_APP_ID }}
     secrets:
       private-key: ${{ secrets.GAMES_APP_PRIVATE_KEY }}
   ```

   For a web game the release also needs `SHA256SUMS` and an
   `actions/attest-build-provenance` attestation covering the web zip (cheesed and
   cookie-doh already do both). Set `"attest": false` in `web` to skip the latter.

## One-time setup

### GitHub App (the ping and the bot PR)

1. Create an app under your account: _Settings → Developer settings → GitHub Apps → New_.
   No webhook. Repository permissions: **Contents: read & write**, **Pull requests: read &
   write**, **Metadata: read**. Only on this account.
2. Install it on **this repository only**. Generate a private key.
3. Here: variable `GAMES_APP_ID`, secret `GAMES_APP_PRIVATE_KEY`.
4. In each game repo: the same variable and secret (see above). The token they mint is
   scoped by `announce.yml` to this one repository.

`repository_dispatch` needs Contents: write; the bot PR needs it too. A PR opened with
`GITHUB_TOKEN` would not trigger CI, which is why the app opens it.

### This repository

- Public (game repos call `announce.yml` from it; reusable workflows must be reachable).
- _Settings → General_: allow auto-merge, allow squash merge, delete head branches.
- Branch protection / ruleset on `main`: require the `ci` status check.
- A `release` label (optional; create-pull-request creates it if missing).

### Deploying

Same pattern as markusmayer.dev: bucket `games.markusmayer.dev` behind the Google load
balancer with Cloud CDN, fronted by Cloudflare; GitHub authenticates through Workload
Identity Federation.

- Bucket with `MainPageSuffix=index.html`, `NotFoundPage=404.html`, public read.
- Backend bucket + host rule for `games.markusmayer.dev` on the url map; DNS at Cloudflare.
- Allow this repository in the WIF provider's attribute condition, and give the deploy
  service account `roles/storage.objectAdmin` on the bucket plus the CDN invalidation
  permission (`compute.urlMaps.invalidateCache`).
- Environment `production` with variables `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`,
  `GCS_BUCKET`, `GCP_URL_MAP`, `GCP_PROJECT`.

## Local

```sh
corepack enable
task dev       # installs, fetches builds, serves
task ci        # lint, type check, tests, build
```

`task builds` downloads each pinned web zip into `.cache/`, checks its SHA-256, verifies
provenance when `gh` is logged in (required in CI), and unpacks it into
`static/builds/<slug>/<version>/`.
