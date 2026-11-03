// The game registry: one games/<slug>.json per game. Shared by the site (through
// import.meta.glob) and by the scripts in scripts/ (through node:fs), so nothing here may
// import from Vite, SvelteKit or Node. games/schema.json documents the same shape for
// editors; `validate` is what actually guards the build and the release sync.

export interface Link {
	label: string;
	/** `{version}` is replaced by the current release tag. */
	url: string;
}

export interface Release {
	version: string;
	date: string;
	url: string;
}

export interface Web {
	/** Release asset name; `{version}` is replaced by the tag. */
	asset: string;
	sha256: string;
	entry?: string;
	aspect?: string;
	attest?: boolean;
}

/**
 * Title art, read from the game's repository at the pinned release tag, so it moves with
 * each release like the build does. Only raster images; never SVG, which can carry script.
 */
export interface Cover {
	/** Path in the game repository, e.g. `docs/screenshots/title.png`. */
	path: string;
	sha256: string;
	alt: string;
	/** Shown under the poster, e.g. what the art's licence asks for. */
	credit?: string;
}

export interface Game {
	slug: string;
	title: string;
	tagline: string;
	description?: string;
	repo: string;
	tags?: string[];
	order?: number;
	hidden?: boolean;
	release: Release;
	web?: Web;
	cover?: Cover;
	links?: Link[];
}

export const SLUG = /^[a-z0-9][a-z0-9-]*$/;
export const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const VERSION = /^v?\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/;
export const SHA256 = /^[0-9a-f]{64}$/;
/** A relative path in a repository to a raster image. */
export const COVER_PATH = /^(?!\/)(?!.*(^|\/)\.\.(\/|$))[\w./-]+\.(png|jpe?g|webp|gif|avif)$/i;

export const fill = (template: string, version: string) =>
	template.replaceAll('{version}', version);

/** The release asset name of a web build at its current version. */
export const webAsset = (game: Game) => game.web && fill(game.web.asset, game.release.version);

/** Where a web build is served, relative to the site root, without a leading slash. */
export const buildPath = (game: Game) =>
	`builds/${game.slug}/${game.release.version}/${game.web?.entry ?? 'index.html'}`;

/** Where a game's cover is served: named by its hash, so it can be cached forever. */
export const coverPath = (game: Game) => {
	const c = game.cover;
	if (!c) return undefined;
	const ext = c.path.slice(c.path.lastIndexOf('.')).toLowerCase();
	return `covers/${game.slug}-${c.sha256.slice(0, 16)}${ext}`;
};

/** Where the cover is read from: the game repository at the pinned tag. */
export const coverSource = (repo: string, version: string, path: string) =>
	`https://raw.githubusercontent.com/${repo}/${encodeURIComponent(version)}/${path}`;

/** Throws with every problem found, prefixed with `where`. */
export function validate(value: unknown, where: string): Game {
	const errors: string[] = [];
	const g = value as Partial<Game> & Record<string, unknown>;
	const str = (v: unknown, name: string, re?: RegExp) => {
		if (typeof v !== 'string' || v.length === 0) errors.push(`${name}: expected a string`);
		else if (re && !re.test(v)) errors.push(`${name}: "${v}" does not match ${re}`);
	};
	if (typeof g !== 'object' || g === null) throw new Error(`${where}: not an object`);
	str(g.slug, 'slug', SLUG);
	str(g.title, 'title');
	str(g.tagline, 'tagline');
	str(g.repo, 'repo', REPO);
	if (g.release === undefined) errors.push('release: missing');
	else {
		str(g.release.version, 'release.version', VERSION);
		str(g.release.date, 'release.date');
		str(g.release.url, 'release.url');
	}
	if (g.web !== undefined) {
		str(g.web.asset, 'web.asset');
		str(g.web.sha256, 'web.sha256', SHA256);
	}
	if (g.cover !== undefined) {
		str(g.cover.path, 'cover.path', COVER_PATH);
		str(g.cover.sha256, 'cover.sha256', SHA256);
		str(g.cover.alt, 'cover.alt');
	}
	for (const [i, l] of (g.links ?? []).entries()) {
		str(l?.label, `links[${i}].label`);
		str(l?.url, `links[${i}].url`);
	}
	if (errors.length) throw new Error(`${where}:\n  ${errors.join('\n  ')}`);
	return g as Game;
}

/** Index order: `order` ascending, then newest release first. */
export function byOrder(a: Game, b: Game) {
	return (
		(a.order ?? Infinity) - (b.order ?? Infinity) ||
		b.release.date.localeCompare(a.release.date) ||
		a.slug.localeCompare(b.slug)
	);
}

/** Semver-ish comparison of two tags; prerelease sorts before its release. */
export function compareVersions(a: string, b: string): number {
	const parse = (v: string) => {
		const [core, pre = ''] = v.replace(/^v/, '').split(/[-+]/, 2);
		return { nums: core.split('.').map(Number), pre };
	};
	const x = parse(a);
	const y = parse(b);
	for (let i = 0; i < 3; i++) if (x.nums[i] !== y.nums[i]) return x.nums[i] - y.nums[i];
	if (x.pre === y.pre) return 0;
	if (!x.pre) return 1;
	if (!y.pre) return -1;
	return x.pre.localeCompare(y.pre, 'en', { numeric: true });
}
