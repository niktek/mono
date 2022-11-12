import { SkelOptions } from './creator';
import fs from 'fs';
import mri from 'mri';
import prompts from 'prompts';
import { bold, cyan, gray, green, red } from 'kleur/colors';
import { createSkeleton } from './creator.js';
import { dist } from './utils.js';


async function main() {
	await createSkeleton(await askForMissingParams(await parseArgs()));
}

async function parseArgs() {
	//Raw grab of args from command line
	const argv = process.argv.slice(2);

	// mri will parse them and expand any shorthand args.  Accepted args are the literal props of SkelOptions
	const args: SkelOptions = mri(argv, {
		alias: {
			h: 'help',
			f: 'framework',
			n: 'name',
			p: 'path',
			t: 'theme',
			m: 'monorepo'
		},
		boolean: ['help', 'noprompt', 'monorepo', 'skeleton']
	});

	// Show help if specified regardless of how many other options are specified
	if (args?.help) {
		console.log('show help');
	}
	return args;
}

async function askForMissingParams(args: SkelOptions) {
	// prettier-ignore
	const disclaimer = `
${bold(cyan('Welcome to 💀 SkeletonUI!'))}

${bold(red('This is BETA software; expect bugs and missing features.'))}

Problems? Open an issue on ${cyan('https://github.com/skeletonlabs/skeleton/issues')} if none exists already.
`;

	const { version } = JSON.parse(
		fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
	);

	if (!args.noprompt) {
		console.log(gray(`\ncreate-skeleton-ui version ${version}`));
		console.log(disclaimer);
	}

	// From here we ask for any missing InstallOptions, unless noprompt is set, in which case we ask for mandatory ones only
	let questions = new Array();

	// Package name
	if (!args?.name) {
		questions.push({ type: 'text', name: 'name', message: 'Name for your new project:' });
	}

	// Framework Selection
	if (!args?.framework) {
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

	if (!args?.types) {
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
	if (!args?.eslint) {
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

	if (!args?.prettier) {
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

	if (!args.playwright) {
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
	if (!args?.noprompt && !args?.twplugins) {
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
	if (!args?.theme) {
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
	if (!args?.template) {
		const q = {
			type: 'select',
			name: 'template',
			message: 'Which Skeleton app template?',
			choices: fs.readdirSync(dist('../templates')).map((dir) => {
				const meta_file = dist(`../templates/${dir}/meta.json`);
				const { title, description } = JSON.parse(fs.readFileSync(meta_file, 'utf8'));
				return {
					title,
					description,
					value: dir
				};
			})
		};
		questions.push(q);
	}
	const response = await prompts(questions);
	Object.keys(response).forEach((prop) => (args[prop] = response[prop]));

	//Map some values for compat with what svelte-add's create expects.  Not that the skeleton references below
	//have nothing to do with SkeletonUI, but rather Svelte's internal naming for their starter templates.
	if (args.framework == 'svelte-kit') {
		args.template = 'skeleton';
	}
	if (args.framework == 'svelte-kit-lib') {
		args.template = 'skeletonlib';
	}
	// We don't ask for path, but it may have been passed in as an arg
	if (args.path == undefined) {
		args.path = '';
	}
	args.path += args.name.replace(/\s+/g, '-').toLowerCase();
	return args;
}
main();
