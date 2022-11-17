#!/usr/bin/env node
import { SkeletonOptions, createSkeleton } from './creator';
import fs from 'fs-extra';
import mri from 'mri';
import prompts from 'prompts';
import { bold, cyan, gray, grey, red } from 'kleur/colors';
import { dist, getHelpText } from './utils';
import path from 'path';

async function main() {
	// grab any passed arguments from the command line
	let opts: SkeletonOptions = await parseArgs();

	if ('quiet' in opts) {
		// in quiet mode we prefill the defaults, then overlay the passed options
		let defaults = new SkeletonOptions();
		opts = Object.assign(defaults, opts);
	} else {
		// in interactie mode we ask the user to fill anything not passed in
		opts = await askForMissingParams(opts);
	}

	// Now that we have all of the options, lets create it.
	await createSkeleton(opts);

	// And give the user some final information on what to do Next
	if (!('quiet' in opts)) {
		// @ts-ignore
		const pm = opts.packagemanager;
		let runString = `${pm} dev`;

		if (pm == 'npm') {
			runString = 'npm run dev';
		}
		// @ts-ignore
		const pathToInstall = opts.path;
		// prettier-ignore
		const finalInstructions =
			bold(
				cyan(`
Done! You can now:

cd ${path.relative(process.cwd() + '/..', pathToInstall)}
${runString}

`)) + grey(`Need some help or found an issue? Visit us on Discord https://discord.gg/EXqV7W8MtY`);
		console.log(finalInstructions);
	}
	process.exit();
}

async function parseArgs() {
	const argv = process.argv.slice(2);

	// mri will parse argv and expand any shorthand args.  Accepted args are the literal props of SkelOptions
	const opts: SkeletonOptions = mri(argv, {
		alias: {
			h: 'help',
			f: 'framework',
			n: 'name',
			p: 'path',
			t: 'skeletontheme',
			m: 'monorepo',
			q: 'quiet'
		},
		boolean: ['help', 'quiet', 'monorepo', 'skeletonui', 'prettier', 'eslint', 'playwright', 'forms', 'typography', 'lineclamp']
	});

	// Show help if specified regardless of how many other options are specified, have fun updating the text string :(
	if ('help' in opts) {
		console.log(getHelpText());
		process.exit();
	}
	return opts;
}

export async function askForMissingParams(opts: SkeletonOptions) {
	// prettier-ignore
	const disclaimer = `
${bold(cyan('Welcome to Skeleton 💀! A UI tookit for Svelte + Tailwind'))}

${bold(red('This is BETA software; expect bugs and missing features.'))}

Problems? Open an issue on ${cyan('https://github.com/skeletonlabs/skeleton/issues')} if none exists already.
`;

	const { version } = JSON.parse(
		fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
	);

	console.log(gray(`\ncreate-skeleton-app version ${version}`));
	console.log(disclaimer);

	// @ts-ignore
	if (!('path' in opts)) opts.path = ''; // We do not ask for a path, but respect any that have been supplied.

	const questions = [];

	//NOTE: When doing checks here, make sure to test for the presence of the prop, not the prop value as it may be set to false deliberately.

	if (!('name' in opts)) {
		questions.push({ type: 'text', name: 'name', message: 'Name for your new project:' });
	}

	if (!('framework' in opts)) {
		const q = {
			type: 'select',
			name: 'framework',
			message: 'Select what framework you wish to use:',
			choices: [
				{ title: 'Svelte Kit', value: 'svelte-kit' },
				{ title: 'Svelte Kit Library', value: 'svelte-kit-lib' }
				// { title: 'Vite (Svelte)', value: 'vite' },
				// { title: 'Astro', value: 'astro' }
			]
		};
		questions.push(q);
	}

	if (!('types' in opts)) {
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

	if (!('eslint' in opts)) {
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

	if (!('prettier' in opts)) {
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

	if (!('playwright' in opts)) {
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
	// if (!('twplugins' in opts)) {
	// 	const q = {
	// 		type: 'multiselect',
	// 		name: 'twplugins',
	// 		message: 'Pick tailwind plugins to add:',
	// 		choices: [
	// 			{ title: 'forms', value: 'forms' },
	// 			{ title: 'typography', value: 'typography' },
	// 			{ title: 'line-clamp', value: 'line-clamp' },
	// 			{ title: 'aspect-ratio', value: 'aspect-ratio' }
	// 		]
	// 	};
	// 	questions.push(q);
	// }

	// Skeleton Theme Selection
	if (!('skeletontheme' in opts)) {
		const q = {
			type: 'select',
			name: 'skeletontheme',
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
	if (!('skeletontemplate' in opts)) {
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

	// Get user responses and overlay them onto the opts to provide a filled configuration
	const response = await prompts(questions, { onCancel });
	Object.keys(response).forEach((prop) => (opts[prop] = response[prop]));

	//Map some values for compat with what svelte-create expects.  Note that the skeleton references below
	//have nothing to do with us, but rather create-svelte's internal naming for their starter templates.
	if (opts.framework == 'svelte-kit') {
		opts.template = 'skeleton';
	}
	if (opts.framework == 'svelte-kit-lib') {
		opts.template = 'skeletonlib';
	}

	return opts;
}
main();
