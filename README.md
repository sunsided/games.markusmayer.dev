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
- **Its machine**: `frame` is the hardware it stands in on the showroom floor (`pc`, a beige
  VGA monitor, `arcade`, an upright cabinet, or `device` for a game that draws its own
  hardware, shown on a display easel), `platform` the era it is styled on, in
  words, and `accent` the colour its screen throws into the room.
- **Launching**: with `web.module` and `web.canvas` (the wasm-bindgen module in the build
  folder and the id of the canvas it binds to), the game runs in the page itself, so the
  Play click counts as the game's own and it may start its sound at once. Without them it
  runs in a frame, a separate document the click never reached, and asks for a click of
  its own. `web.native` is the game's own screen (`[320, 200]`): games that scale by whole
  numbers get the next whole multiple of it, scaled to fit the tube. `web.options` are the
  launch options (`{ "cracktro": true }`), passed as `data-*` attributes on an embedded
  game's canvas or as a query string to a framed one. `web.variants` names alternatives
  (Cookie D'oh!'s cracked and registered versions), shown as buttons; switching while
  running sends the game's `web.restart` event with the options as its detail.
- **Title card** (optional `cover`): a PNG, JPEG, WebP, GIF or AVIF from the game's
  repository, read at the release tag (`"path": "docs/screenshots/title.png"`) and pinned by
  SHA-256 like the build; each release sync re-pins it. It is the card's art, the game
  page's click-to-play poster (so the wasm only loads on Play) and the `og:image`. Served
  as `/covers/<slug>-<hash>.<ext>`. `alt` is required; `credit` is shown under the poster.
  Without a cover the card shows the title on a CRT-style backdrop.

## Adding a game

1. Write `games/<slug>.json` here (copy one). Leave out `release`, `web.sha256` and
   `cover.sha256` if the game has not released yet: it stays off the floor until its first
   release ping fills them in. Merge it. `web.assets` names the build's asset folder for
   games that load files at runtime (handed over as `data-assets`).
2. In the game repository: create an environment `games` with deployment tags limited to
   `v*`, put the **announce** app's key (see below) in it as secret
   `GAMES_ANNOUNCE_APP_PRIVATE_KEY`, set variable `GAMES_ANNOUNCE_APP_ID`, and add to its
   release workflow, after the job that publishes the release:

   ```yaml
   announce:
     needs: [release]
     uses: sunsided/games.markusmayer.dev/.github/workflows/announce.yml@main
     with:
       app-id: ${{ vars.GAMES_ANNOUNCE_APP_ID }}
   ```

   The announce job runs in that environment. Create it before the first release: a
   missing one is created on the fly, unprotected. A repository-level secret passed as
   `secrets: private-key:` still works for games that have not moved yet.

   For a web game the release also needs `SHA256SUMS` and an
   `actions/attest-build-provenance` attestation covering the web zip (cheesed and
   cookie-doh already do both). Set `"attest": false` in `web` to skip the latter. The zip
   may hold only regular files and folders: symlinks, absolute paths and `..` are refused.

## One-time setup

### Two GitHub Apps

Both are installed on **this repository only**, with no webhook.

| App                       | Permissions                                     | Key lives in    |
| ------------------------- | ----------------------------------------------- | --------------- |
| `sunsided-games-release`  | Contents: write, Pull requests: write, Metadata | this repo only  |
| `sunsided-games-announce` | Contents: write, Metadata                       | every game repo |

- This repo: variable `GAMES_APP_ID`, secret `GAMES_APP_PRIVATE_KEY` (release app). It opens
  and auto-merges the registry PR. A PR opened with `GITHUB_TOKEN` would not trigger CI.
- Game repos: `GAMES_ANNOUNCE_APP_ID`, `GAMES_ANNOUNCE_APP_PRIVATE_KEY` (announce app).
  `repository_dispatch` needs Contents: write and nothing more.

The split is what keeps a compromised game repository from shipping code here: with the
announce key alone it cannot open a pull request, so nothing it pushes gets past the
ruleset into `main`, and only `main` can deploy (the Workload Identity provider is bound to
`refs/heads/main`). What it can do is send a dispatch, which still has to pass the release
checks in `sync-game.ts`, or push a stray branch.

### This repository

- Public, or _Settings → Actions → General → Access_ opened to repositories owned by the
  user: game repos call `announce.yml` from here.
- _Settings → General_: allow auto-merge, allow squash merge, delete head branches.
- Ruleset on `main`: require a pull request, require the `ci` status check, block force
  pushes and deletion.
- A `release` label (optional; create-pull-request creates it if missing).

### Deploying

Same pattern as markusmayer.dev: bucket `games.markusmayer.dev` behind the Google load
balancer with Cloud CDN, fronted by Cloudflare; GitHub authenticates through Workload
Identity Federation. Step-by-step `gcloud`, `cf` and `gh` commands, runnable from any
machine: [docs/infrastructure.md](docs/infrastructure.md).

## Local

```sh
corepack enable
task dev       # installs, fetches builds, serves
task ci        # lint, type check, tests, build
```

`task builds` downloads each pinned web zip into `.cache/`, checks its SHA-256, verifies
provenance when `gh` is logged in (required in CI), and unpacks it into
`static/builds/<slug>/<version>/`.
