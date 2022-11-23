// Types
import { create } from 'create-svelte';
import process from 'process';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'path';
import { dist, whichPMRuns } from './utils.js';
import { bold, red, cyan } from 'kleur/colors';

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
	_: string[] = []; //catch all for extraneous params from mri, used to capture project name.
	help: boolean = false;
	quiet: boolean = false;
	framework: 'svelte-kit' | 'svelte-kit-lib' = 'svelte-kit';
	path: string = '.';
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
	verbose: boolean = false;
	monorepo: boolean = false;
	packages: string[] = [];
	skeletonui: boolean = true;
	skeletontemplatedir: string = 'templates';
	workspace: string = '';
}

export async function createSkeleton(opts: SkeletonOptions) {
	//create-svelte will happily overwrite an existing directory, foot guns are bad mkay
	opts.path = path.resolve(opts?.path, opts.name.replace(/\s+/g, '-').toLowerCase());

	if (fs.existsSync(opts.path)) {
		console.error(red(bold('Install directory already exists!')));
		process.exit();
	}
	fs.mkdirp(opts.path);

	//create-svelte will build the base install for us
	create(opts.path, opts);
	process.chdir(opts.path);

	// install packages
	// we can't just populate package.json directly as we don't know the version numbers to install and using 'next' will barf
	// we can't just efficiently install them with {pm} i -D <list of packages> because yarn

	opts.packagemanager = whichPMRuns()?.name || 'npm';

	// the order matters due to dependency resolution, because yarn
	let packages = [
		'postcss',
		'autoprefixer',
		'tailwindcss',
		'svelte-preprocess',
		'@brainandbones/skeleton'
	];

	if (opts?.typography) packages.push('@tailwindcss/typography');
	if (opts?.forms) packages.push('@tailwindcss/forms');
	if (opts?.lineclamp) packages.push('@tailwindcss/line-clamp');

	if (!('quiet' in opts)) {
		console.log('Working...');
	}

	//add them individually, because yarn
	packages.forEach((val) => {
		let result = spawnSync(opts.packagemanager, ['add', '-D', val], { shell: true });
		// Capture any errors from stderr and display for the user to report it to us
		// Don't bother for yarn, as it will error (thats right, fucking error) on a warning, which doesn't affect the install, about adding to a non private project in a workspace
		// That's literally how a fucking monorepo works you fucking imbeciles.  Public projects in a private workspace.
		if (!(opts.packagemanager == "yarn") && result?.stderr.toString().length) {
			console.log(
				'An error has occurred trying to install packages with your package manager, please send us the following text onto our Github or Discord:\n',
				result?.stderr.toString()
			);
			process.exit();
		}
		
		// Just to help with any user error reports
		if (opts.verbose) {
			const stdout = result?.stdout.toString();
			if (stdout.length) console.log(bold(cyan('stdout:')), stdout);
			const stderr = result?.stderr.toString();
			if (stderr.length) console.log(bold(red("stderr:")), stderr);
		 }
	});

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
	if (opts.forms == true) plugins.push(`require('@tailwindcss/forms')`);
	if (opts.typography == true) plugins.push(`require('@tailwindcss/typography')`);
	if (opts.lineclamp == true) plugins.push(`require('@tailwindcss/line-clamp')`);
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
	const src = path.resolve(dist(opts.skeletontemplatedir), opts.skeletontemplate);

	fs.copySync(src + '/src', './src', { overwrite: true });
	fs.copySync(src + '/static', './static', { overwrite: true });

	// patch back in their theme choice - it may have been replaced by the theme template, it may still be the correct auto-genned one, depends on the template - we don't care, this fixes it.
	let content = fs.readFileSync('./src/routes/+layout.svelte', { encoding: 'utf8', flag: 'r' });
	const reg = /theme-.*\.css';$/gim;
	fs.writeFileSync(
		'./src/routes/+layout.svelte',
		content.replace(reg, `theme-${opts.skeletontheme}.css';`)
	);
	// update the <body> to have the data-theme
	content = fs.readFileSync('./src/app.html', { encoding: 'utf8', flag: 'r' });
	fs.writeFileSync(
		'./src/app.html',
		content.replace('<body>', `<body data-theme="${opts.skeletontheme}">`)
	);
}

function out(filename: string, data: string) {
	fs.writeFileSync(filename, data);
}
