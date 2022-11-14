// Types
import { create } from 'create-svelte';
import { Options } from 'create-svelte/types/internal';
import whichPMRuns from 'which-pm-runs';
import process from 'process';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'path';
import { dist } from './utils.js';

export type SkelOptions = Options & {
	help: boolean;
	quiet: boolean;
	framework: 'svelte-kit-lib' | 'svelte-kit' | 'vite' | 'astro';
	path: string;
	name: string;
	twplugins: Array<'forms' | 'typography' | 'line-clamp' | 'aspect-ratio' | null> | 'none';
	theme:
		| 'skeleton'
		| 'modern'
		| 'hamlindigo'
		| 'rocket'
		| 'sahara'
		| 'gold-nouveau'
		| 'vintage'
		| 'seafoam'
		| 'crimson';
	skeletontemplate: string;
	templatePath: string;
	skeletonui: boolean;
	monorepo: boolean;
	packages: string[];
	workspace: string;
};

export function createSkeleton(opts: SkelOptions) {
	//create-svelte will happily overwrite an existing directory, foot guns are bad mkay
	if (fs.existsSync(opts.path)) {
		console.log('Install directory already exists!');
		return;
	}

	//create-svelte will build the base install for us
	create(opts.path, opts);
	process.chdir(opts.path);

	// install packages
	const installParams = [
		'i',
		'-D',
		'tailwindcss',
		'postcss',
		'autoprefixer',
		'svelte-preprocess',
		'@brainandbones/skeleton'
	];

	if (opts.twplugins != null && opts.twplugins != 'none') {
		opts.twplugins.map((val) => installParams.push('@tailwindcss/' + val));
	}

	if (!opts.quiet) {
		console.log('Working..');
	}

	spawnSync(whichPMRuns().name, installParams);

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

function createTailwindConfig(opts: SkelOptions) {
	const plugins = [`require('@brainandbones/skeleton/tailwind/theme.cjs')`];
	if (opts.twplugins != null && opts.twplugins != 'none') {
		opts.twplugins.map((val) => plugins.push(`require('@tailwindcss/${val}')`));
	}
	const aspectRatio = (opts.twplugins.includes('aspect-ratio')) ? `
	corePlugins: { aspectRatio: false }, ` : '';
	const str = `/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',${aspectRatio}
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

function createSvelteKitLayout(opts: SkelOptions) {
	const str = `<script>
	import '@brainandbones/skeleton/themes/theme-${opts.theme}.css';
	import '@brainandbones/skeleton/styles/all.css';
	import '../app.postcss';
</script>
<slot/>`;
	return str;
}

function copyTemplate(opts: SkelOptions) {
	const src = path.resolve(dist('../templates/'), opts.skeletontemplate + '/');
	fs.copySync(src, './src/', { overwrite: true });
	// patch back in their theme choice - it may have been replaced by the theme template, it may still be the correct auto-genned one, depends on the template - we don't care, this fixes it.
	const content = fs.readFileSync('./src/routes/+layout.svelte', { encoding: 'utf8', flag: 'r' });
	const reg = /theme-.*\.css';$/gim;
	fs.writeFileSync(
		'./src/routes/+layout.svelte',
		content.replace(reg, `theme-${opts.theme}.css';`)
	);
}

function out(filename: string, data: string) {
	fs.writeFileSync(filename, data);
}