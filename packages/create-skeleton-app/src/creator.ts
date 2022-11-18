// Types
import { create } from 'create-svelte';
import whichPMRuns from 'which-pm-runs';
import process from 'process';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'path';
import { dist } from './utils.js';
import { type Options } from 'create-svelte/types/internal';

// NOTE: Any changes here must also be reflected in the --help output in utils.ts and shortcut expansions in bin.ts.
// Probably a good idea to do a search on the values you are changing to catch any other areas they are used in
// Codebase would be a lot cleaner if Reflect() actually returned anything useful.
// unbuild doesn't seem to like it when SkeletonOptions implements the Options type from create-svelte's internal type definitions
// so they are copied over here just to make everything even more brittle.

export class SkeletonOptions {
	// svelte-create expects these options, do not change the names or values.
	name: string = 'new-skel-app';
	template: 'default' | 'skeleton' | 'skeletonlib' = 'skeleton';
	types: 'typescript' | 'checkjs' | null = 'typescript';
	prettier: boolean = true;
	eslint: boolean = true;
	playwright: boolean = false;

	// create-skeleton-app additions
	_: string[]; //catch all for extraneous params from mri, used to capture project name.
	help: boolean;
	quiet: boolean;
	framework: 'svelte-kit' | 'svelte-kit-lib' = 'svelte-kit';
	path: string = '';
	forms: boolean = false;
	typography: boolean = false;
	lineclamp: boolean = false;
	skeletontheme:
		| 'skeleton'
		| 'modern'
		| 'hamlindigo'
		| 'rocket'
		| 'sahara'
		| 'gold-nouveau'
		| 'vintage'
		| 'seafoam'
		| 'crimson' = 'skeleton';
	skeletontemplate: string = 'bare';
	packagemanager: string = 'npm';
	// props below are private to the Skeleton team
	monorepo: boolean = false;
	packages: string[];
	skeletonui: boolean = true;
	workspace: string;
}

export async function createSkeleton(opts: SkeletonOptions) {
	//create-svelte will happily overwrite an existing directory, foot guns are bad mkay
	opts.path = path.resolve(opts?.path, opts.name.replace(/\s+/g, '-').toLowerCase());

	if (fs.existsSync(opts.path)) {
		console.error('Install directory already exists!');
		return;
	}
	fs.mkdirp(opts.path);

	//create-svelte will build the base install for us
	create(opts.path, opts);
	process.chdir(opts.path);

	// install packages
	let installParams = [
		'i',
		'-D',
		'tailwindcss',
		'postcss',
		'autoprefixer',
		'svelte-preprocess',
		'@brainandbones/skeleton'
	];

	if (opts?.typography) installParams.push('@tailwindcss/typography')
	if (opts?.forms) installParams.push('@tailwindcss/forms');
	if (opts?.lineclamp) installParams.push('@tailwindcss/line-clamp');

	if (!('quiet' in opts)) {
		console.log('Working...');
	}

	opts.packagemanager = whichPMRuns()?.name || 'npm';
	const result = spawnSync(opts.packagemanager, installParams, { shell: true });

	// Capture any errors from stderr and display for the user to report it to us
	if (result?.stderr.toString().length) {
		console.log(
			'An error has occurred trying to install packages with your package manager, please send us the following text onto our Github or Discord:\n',
			result?.stderr.toString()
		);
		process.exit();
	}
	console.log('stderr :\n', result?.stderr.toString());

	// write out config files
	out('svelte.config.js', createSvelteConfig());
	out('tailwind.config.cjs', createTailwindConfig(opts));
	out('postcss.config.cjs', createPostCssConfig());
	if (opts.framework == 'svelte-kit' || opts.framework == 'svelte-kit-lib') {
		out(path.resolve(process.cwd(), 'src/routes/', '+layout.svelte'), createSvelteKitLayout(opts));
		out(path.resolve(process.cwd(), 'src/', 'app.postcss'), '/*place global styles here */');
	}

	// copy over selected template
	copyTemplate(opts);
	return opts;
}

function createSvelteConfig() {
	const str = `import adapter from '@sveltejs/adapter-auto';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	vitePlugin: {
        emitCss: false,
    },
    compilerOptions: {
        css: "injected",
    },
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
};

export default config;
`;
	return str;
}

function createTailwindConfig(opts: SkeletonOptions) {
	let plugins = [];
	if (opts?.forms) plugins.push(`require('@tailwindcss/forms')`);
	if (opts?.typography) plugins.push(`require('@tailwindcss/typography')`);
	if (opts?.lineclamp) plugins.push(`require('@tailwindcss/line-clamp')`);
	plugins.push(`require('@brainandbones/skeleton/tailwind/theme.cjs')`);

	
	const str = `/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', require('path').join(require.resolve('@brainandbones/skeleton'), '../**/*.{html,js,svelte,ts}')],
	theme: {
		extend: {},
	},
	plugins: [${plugins.join(',')}],
}
`;
	return str;
}

function createPostCssConfig() {
	const str = `module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
}`;
	return str;
}

function createSvelteKitLayout(opts: SkeletonOptions) {
	const str = `<script>
	import '@brainandbones/skeleton/themes/theme-${opts.skeletontheme}.css';
	import '@brainandbones/skeleton/styles/all.css';
	import '../app.postcss';
</script>
<slot/>`;
	return str;
}

function copyTemplate(opts: SkeletonOptions) {
	const src = path.resolve(dist('../templates/'), opts.skeletontemplate + '/');
	fs.copySync(src, './src/', { overwrite: true });
	// patch back in their theme choice - it may have been replaced by the theme template, it may still be the correct auto-genned one, depends on the template - we don't care, this fixes it.
	const content = fs.readFileSync('./src/routes/+layout.svelte', { encoding: 'utf8', flag: 'r' });
	const reg = /theme-.*\.css';$/gim;
	fs.writeFileSync(
		'./src/routes/+layout.svelte',
		content.replace(reg, `theme-${opts.skeletontheme}.css';`)
	);
}

function out(filename: string, data: string) {
	fs.writeFileSync(filename, data);
}
