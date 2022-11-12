// Types
import { create } from 'create-svelte';
import { Options } from 'create-svelte/types/internal';
import whichPMRuns from 'which-pm-runs';
import process from 'process';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs';
import { Buffer } from 'node:buffer';

export type SkelOptions = Options & {
	help: boolean;
	noprompt: boolean;
	framework: 'svelte-kit-lib' | 'svelte-kit' | 'vite' | 'astro';
	path: string;
	name: string;
	twplugins: Array<'forms' | 'typography' | 'line-clamp' | 'aspect-ratio' | null>;
	theme: Array<
		| 'skeleton'
		| 'modern'
		| 'hamlindigo'
		| 'rocket'
		| 'sahara'
		| 'gold-nouveau'
		| 'vintage'
		| 'seafoam'
		| 'crimson'
	>;
	skeletontemplate: string;
	templatePath: string;
	skeleton: boolean;
	monorepo: boolean;
	packages: string[];
	workspace: string;
};

export function createSkeleton(opts: SkelOptions) {
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
	if (opts.twplugins != null) {
		opts.twplugins.map((val) => installParams.push('@tailwindcss/' + val));
	}
	const pm = spawn(whichPMRuns().name, installParams, { cwd: process.cwd() });

	// write out config files
	out('svelte.config.js', createSvelteConfig());
	out('tailwind.config.cjs', createTailwindConfig(opts));
	out('postcss.config.cjs', createPostCssConfig());
	console.log('Done');
}

function createSvelteConfig() {
	let str = `import adapter from '@sveltejs/adapter-auto';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
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
	let plugins = [`require('@brainandbones/skeleton/tailwind/theme.cjs')`];
	if (opts.twplugins != null) {
		opts.twplugins.map((val) => plugins.push(`require('@tailwindcss/'${val}')`));
	}
	let str = `/** @type {import('tailwindcss').Config} */
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
	let str = `module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
}`;
	return str;
}

function out(filename: string, data: string) {
	writeFile(filename, new Uint8Array(Buffer.from(data)), () =>
		console.log(`Error writing ${filename}`)
	);
}