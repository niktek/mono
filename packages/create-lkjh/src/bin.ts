#!/usr/bin/env node
import { SkelOptions, createSkeleton } from './creator';
import fs from 'fs-extra';
import mri from 'mri';
import prompts from 'prompts';
import { bold, cyan, gray, red } from 'kleur/colors';
import { dist } from './utils';

async function main() {
	const opts = await createSkeleton(await askForMissingParams(await parseArgs()));
	if (!opts?.quiet) {
		let runString = `${opts.packagemanager} dev`
		if (opts.packagemanager == 'npm') {
			runString = 'npm run dev'
		}
		const finalInstructions = `Done! You can now:
cd ${opts.path}
${runString}`;
		console.log(bold(cyan(finalInstructions)));
	}
	process.exit();
}

async function parseArgs() {
	const argv = process.argv.slice(2);

	// mri will parse argv and expand any shorthand args.  Accepted args are the literal props of SkelOptions
	const args: SkelOptions = mri(argv, {
		alias: {
			h: 'help',
			f: 'framework',
			n: 'name',
			p: 'path',
			t: 'theme',
			m: 'monorepo',
			q: 'quiet'
		},
		boolean: ['help', 'quiet', 'monorepo', 'skeletonui']
	});

	// Show help if specified regardless of how many other options are specified, this is not automatic from mri or prompts :(
	if (args?.help) {
		console.log(`coming once it's all agreed upon`);
	}
	return args;
}

export async function askForMissingParams(opts: SkelOptions) {
	// If --quiet is passed, we check if we have the minimum required info to proceed and set sane defaults for everything else
	if (opts.quiet) {
		if (!opts.name) opts.name = 'new-site';
		if (!opts.types) opts.types = 'typescript';
		if (!opts.eslint) opts.eslint = true;
		if (!opts.prettier) opts.prettier = true;
		if (!opts.playwright) opts.playwright = false;
		if (!opts.template) opts.template = 'skeleton'; //This is SK's skeleton template, nothing to do with us
		if (!opts.theme) opts.theme = 'skeleton';
		if (!opts.skeletontemplate) opts.skeletontemplate = 'bare';
	}

	// prettier-ignore
	const disclaimer = `
${bold(cyan('Welcome to Skeleton 💀! A UI tookit for Svelte + Tailwind'))}

${bold(red('This is BETA software; expect bugs and missing features.'))}

Problems? Open an issue on ${cyan(
		'https://github.com/skeletonlabs/skeleton/issues'
	)} if none exists already.
`;

	const { version } = JSON.parse(
		fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
	);

	if (!opts.quiet) {
		console.log(gray(`\ncreate-skeleton-app version ${version}`));
		console.log(disclaimer);
	}

	// From here we ask for any missing InstallOptions, unless noprompt is set, in which case we ask for mandatory ones only
	const questions = [];

	// Package name
	if (!opts?.name) {
		questions.push({ type: 'text', name: 'name', message: 'Name for your new project:' });
	}

	// Framework Selection
	if (!opts?.framework) {
		const q = {
			type: 'select',
			name: 'framework',
			message: 'Select what framework you wish to use:',
			choices: [
				{ title: 'Svelte Kit', value: 'svelte-kit' },
				{ title: 'Svelte Kit Library', value: 'svelte-kit-lib' },
				{ title: 'Vite (Svelte)', value: 'vite' },
				{ title: 'Astro', value: 'astro' }
			]
		};
		questions.push(q);
	}

	if (!opts?.types) {
		const q = {
			type: 'select',
			name: 'types',
			message: 'Add type checking with TypeScript?',
			initial: false,
			choices: [
				{
					title: 'Yes, using JavaScript with JSDoc comments',
					value: 'checkjs'
				},
				{
					title: 'Yes, using TypeScript syntax',
					value: 'typescript'
				},
				{ title: 'No', value: null }
			]
		};
		questions.push(q);
	}
	if (!opts?.eslint) {
		const q = {
			type: 'toggle',
			name: 'eslint',
			message: 'Add ESLint for code linting?',
			initial: false,
			active: 'Yes',
			inactive: 'No'
		};
		questions.push(q);
	}

	if (!opts?.prettier) {
		const q = {
			type: 'toggle',
			name: 'prettier',
			message: 'Add Prettier for code formatting?',
			initial: false,
			active: 'Yes',
			inactive: 'No'
		};
		questions.push(q);
	}

	if (!opts.playwright) {
		const q = {
			type: 'toggle',
			name: 'playwright',
			message: 'Add Playwright for browser testing?',
			initial: false,
			active: 'Yes',
			inactive: 'No'
		};
		questions.push(q);
	}
	// Tailwind Plugin Selection
	if (!opts?.quiet && !opts?.twplugins) {
		const q = {
			type: 'multiselect',
			name: 'twplugins',
			message: 'Pick tailwind plugins to add:',
			choices: [
				{ title: 'forms', value: 'forms' },
				{ title: 'typography', value: 'typography' },
				{ title: 'line-clamp', value: 'line-clamp' },
				{ title: 'aspect-ratio', value: 'aspect-ratio' }
			]
		};
		questions.push(q);
	}

	// Skeleton Theme Selection
	if (!opts?.theme) {
		const q = {
			type: 'select',
			name: 'theme',
			message: 'Select a theme:',
			initial: 0,
			choices: [
				{ title: 'Skeleton', value: 'skeleton' },
				{ title: 'Modern', value: 'modern' },
				{ title: 'Hamlindigo', value: 'hamlindigo' },
				{ title: 'Rocket', value: 'rocket' },
				{ title: 'Sahara', value: 'sahara' },
				{ title: 'Gold Nouveau', value: 'gold-nouveau' },
				{ title: 'Vintage', value: 'vintage' },
				{ title: 'Seafoam', value: 'seafoam' },
				{ title: 'Crimson', value: 'crimson' }
			]
		};
		questions.push(q);
	}

	//Skeleton Template Selection
	if (!opts?.skeletontemplate) {
		const q = {
			type: 'select',
			name: 'skeletontemplate',
			message: 'Which Skeleton app template?',
			choices: fs
				.readdirSync(dist('../templates'))
				.map((dir) => {
					const meta_file = dist(`../templates/${dir}/meta.json`);
					const { position, title, description } = JSON.parse(fs.readFileSync(meta_file, 'utf8'));
					return {
						position,
						title,
						description,
						value: dir
					};
				})
				.sort((a, b) => a.position - b.position)
		};
		questions.push(q);
	}
	const onCancel = () => {
		console.log('Exiting');
		process.exit();
	};

	// ts-ignore
	const response = await prompts(questions, { onCancel });
	Object.keys(response).forEach((prop) => (opts[prop] = response[prop]));

	//Map some values for compat with what svelte-add's create expects.  Not that the skeleton references below
	//have nothing to do with SkeletonUI, but rather Svelte's internal naming for their starter templates.
	if (opts.framework == 'svelte-kit') {
		opts.template = 'skeleton';
	}
	if (opts.framework == 'svelte-kit-lib') {
		opts.template = 'skeletonlib';
	}
	// We don't ask for path, but it may have been passed in as an arg
	if (opts.path == undefined) {
		opts.path = '';
	}
	opts.path += opts.name.replace(/\s+/g, '-').toLowerCase();
	return opts;
}
main();
