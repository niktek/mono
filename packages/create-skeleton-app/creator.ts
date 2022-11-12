// Types
import { create } from 'create-svelte';
import { Options } from 'create-svelte/types/internal'
import process from 'process';

export type SkelOptions = Options & {
	help: boolean;
	noprompt: boolean;
	framework: 'svelte-kit-lib' | 'svelte-kit' | 'vite' | 'astro';
	path: string;
	name: string;
	twplugins: Array<'forms' | 'typography' | 'line-clamp' | 'aspect-ratio' | null>;
	theme: Array<
		'skeleton' | 'modern' | 'hamlindigo' | 'rocket' | 'sahara' | 'gold-nouveau' | ' vintage' | 'seafoam' | 'crimson'>;
	skeletontemplate: string;
	templatePath: string;
	skeleton: boolean;
	monorepo: boolean;
	packages: string[];
	workspace: string;
};

export function createSkeleton(opts: SkelOptions) {
	// create-svelte will build the base install for us
	create(opts.path, opts);
	process.chdir(opts.path);
	console.log(process.cwd());
}