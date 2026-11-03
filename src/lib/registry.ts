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

/**
 * Launch options. Embedded games get them as data attributes on their canvas
 * (`{ cracktro: true }` is `data-cracktro`) and in the restart event's detail; framed ones as
 * a query string (`?cracktro`). `false` leaves an option out of both.
 */
export type Options = Record<string, boolean | string>;

export interface Variant {
	label: string;
	options: Options;
}

export interface Web {
	/** Release asset name; `{version}` is replaced by the tag. */
	asset: string;
	/** Pinned with the release; absent until the first one. */
	sha256?: string;
	entry?: string;
	aspect?: string;
	/**
	 * The game's own screen in pixels, `[width, height]`. Games that scale by whole numbers
	 * only get their frame at the next whole multiple of this, scaled to fit.
	 */
	native?: [number, number];
	/**
	 * Embed the game in the page rather than framing it: its wasm-bindgen module in the
	 * build folder (`cheese.js`) and the id of the canvas it binds to (`cheese`). The Play
	 * click then counts as the game's own, so it may start its sound at once; a framed game
	 * is a separate document the click never reached.
	 */
	module?: string;
	canvas?: string;
	/** The event an embedded game restarts on, dispatched on its canvas with the options. */
	restart?: string;
	/**
	 * Folder in the build the game loads its assets from, handed to an embedded game as
	 * `data-assets` on its canvas (resolved to the pinned build), e.g. `assets`.
	 */
	assets?: string;
	/** Launch options for the default start. */
	options?: Options;
	/** Named ways to launch the same build; the first is the one Play starts. */
	variants?: Variant[];
	attest?: boolean;
}

/**
 * Title art, read from the game's repository at the pinned release tag, so it moves with
 * each release like the build does. Only raster images; never SVG, which can carry script.
 */
export interface Cover {
	/** Path in the game repository, e.g. `docs/screenshots/title.png`. */
	path: string;
	/** Pinned with the release; absent until the first one. */
	sha256?: string;
	alt: string;
	/** Shown under the poster, e.g. what the art's licence asks for. */
	credit?: string;
}

/** The hardware a game is shown in, after the era it is styled on. */
export type Frame = 'pc' | 'arcade' | 'device';
/** `device`: the game draws its own hardware (a handheld, say), so it gets no machine. */
export const FRAMES: readonly Frame[] = ['pc', 'arcade', 'device'];

export interface Game {
	slug: string;
	title: string;
	tagline: string;
	description?: string;
	repo: string;
	tags?: string[];
	order?: number;
	hidden?: boolean;
	/** Which machine it stands in on the showroom floor. Defaults to `pc`. */
	frame?: Frame;
	/** The era it is styled on, in words, e.g. "DOS PC, VGA 320×200". */
	platform?: string;
	/** The colour its screen throws into the room, as #rrggbb. */
	accent?: string;
	/**
	 * The release the site serves. Absent while a game is registered but not yet released:
	 * it is then neither listed nor built, and its first release ping fills this in (with
	 * the build's and cover's hashes) like any later one.
	 */
	release?: Release;
	web?: Web;
	cover?: Cover;
	links?: Link[];
}

export const SLUG = /^[a-z0-9][a-z0-9-]*$/;
export const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const VERSION = /^v?\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/;
export const SHA256 = /^[0-9a-f]{64}$/;
export const HEX = /^#[0-9a-fA-F]{6}$/;
/** A relative path in a repository to a raster image. */
export const COVER_PATH = /^(?!\/)(?!.*(^|\/)\.\.(\/|$))[\w./-]+\.(png|jpe?g|webp|gif|avif)$/i;

export const fill = (template: string, version: string) =>
	template.replaceAll('{version}', version);

/** A game with a release: the only kind the site lists, builds and serves. */
export type Released = Game & { release: Release };
export const isReleased = (game: Game): game is Released => game.release !== undefined;

/** The release asset name of a web build at its current version. */
export const webAsset = (game: Released) => game.web && fill(game.web.asset, game.release.version);

/** Where a web build is served, relative to the site root, without a leading slash. */
export const buildPath = (game: Released) =>
	`builds/${game.slug}/${game.release.version}/${game.web?.entry ?? 'index.html'}`;

/** Options as a query string for a framed game: `{ cracktro: true, gfx: 'ega' }` → `cracktro&gfx=ega`. */
export const toQuery = (options: Options = {}) =>
	Object.entries(options)
		.filter(([, v]) => v !== false)
		.map(([k, v]) => (v === true ? k : `${k}=${encodeURIComponent(v)}`))
		.join('&');

/** Where a game's cover is served: named by its hash, so it can be cached forever. */
export const coverPath = (game: Game) => {
	const c = game.cover;
	if (!c?.sha256) return undefined;
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
	if (g.release !== undefined) {
		str(g.release.version, 'release.version', VERSION);
		str(g.release.date, 'release.date');
		str(g.release.url, 'release.url');
	}
	if (g.frame !== undefined && !FRAMES.includes(g.frame)) {
		errors.push(`frame: "${g.frame}" is not one of ${FRAMES.join(', ')}`);
	}
	if (g.accent !== undefined) str(g.accent, 'accent', HEX);
	if (g.web !== undefined) {
		str(g.web.asset, 'web.asset');
		if (g.web.sha256 !== undefined || g.release !== undefined) {
			str(g.web.sha256, 'web.sha256', SHA256);
		}
		if (g.web.assets !== undefined) str(g.web.assets, 'web.assets', /^[\w.-]+(\/[\w.-]+)*$/);
		if (g.web.module !== undefined) str(g.web.module, 'web.module', /^[\w.-]+\.js$/);
		if (g.web.canvas !== undefined) str(g.web.canvas, 'web.canvas', /^[A-Za-z][\w-]*$/);
		if ((g.web.module === undefined) !== (g.web.canvas === undefined)) {
			errors.push('web.module and web.canvas: give both to embed the game, or neither');
		}
		if (g.web.restart !== undefined) str(g.web.restart, 'web.restart', /^[\w:.-]+$/);
		const options = (o: unknown, name: string) => {
			if (o === undefined) return;
			if (typeof o !== 'object' || o === null || Array.isArray(o)) {
				errors.push(`${name}: expected an object of options`);
				return;
			}
			for (const [k, v] of Object.entries(o)) {
				if (!/^[a-z][a-z0-9-]*$/.test(k)) errors.push(`${name}.${k}: not a valid option name`);
				if (typeof v !== 'boolean' && !(typeof v === 'string' && /^[\w.-]*$/.test(v))) {
					errors.push(`${name}.${k}: expected true, false or a plain word`);
				}
			}
		};
		options(g.web.options, 'web.options');
		for (const [i, v] of (g.web.variants ?? []).entries()) {
			str(v?.label, `web.variants[${i}].label`);
			options(v?.options ?? {}, `web.variants[${i}].options`);
		}
		const n = g.web.native;
		if (
			n !== undefined &&
			!(Array.isArray(n) && n.length === 2 && n.every((v) => Number.isInteger(v) && v > 0))
		) {
			errors.push('web.native: expected [width, height] in whole pixels');
		}
	}
	if (g.cover !== undefined) {
		str(g.cover.path, 'cover.path', COVER_PATH);
		if (g.cover.sha256 !== undefined || g.release !== undefined) {
			str(g.cover.sha256, 'cover.sha256', SHA256);
		}
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
export function byOrder(a: Released, b: Released) {
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
