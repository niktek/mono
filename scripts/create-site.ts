import { create } from 'create-svelte';
import minimist from 'minimist';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import process from 'process';

type Packages = {
	[key:string]: string
}

type InstallOptions = {
	type: 'svelte-kit-lib' | 'svelte-kit' | 'svelte' | 'astro';
	path: string;
	name: string;
	skeleton: boolean;
	tailwindForms: boolean;
	tailwindTypography: boolean;
	tailwindAspectRatio: boolean;
	tailwindLineClamp: boolean;
	monorepo: boolean;
	additionalPackages: Packages;
	additionalPackagesWorkspace: string;
	template: string;
	templateDir: string;
}



var args = minimist(process.argv.slice(2));

function check_exists(paths: string[]) {
	let errors = [];
	paths.forEach((val) => {
		try {
			if (fs.existsSync(val)) {
				errors.push(`Error: ${val} already exists`);
			}
		} catch {
			return errors.push(`Error detecting ${val}`);
		}
	});
	return errors;
}

let dirs = [];
switch (typeof args.l) {
	case 'string':
		dirs.push('packages/' + args.l);
		break;
	case 'object':
		for (const prop in args.l) {
			dirs.push('packages/' + args.l[prop]);
		}
		break;
}
switch (typeof args.s) {
	case 'string':
		dirs.push('sites/' + args.s);
		break;
	case 'object':
		for (const prop in args.s) {
			dirs.push('sites/' + args.s[prop]);
		}
		break;
}
const errors = check_exists(dirs);
if (errors.length) {
	errors.forEach((val) => {
		console.log(pc.red(val));
	});
	console.log(pc.red('Nothing touched, command aborted'));
	process.exit();
}
console.log(dirs);

process.exit();
if (args.length > 1 || args.length == 0) {
	console.log(
		pc.red(
			"Sitename is the only argument, it must be a contiguous string and cannot begin with a '-'"
		)
	);
}
const sitename = args[0];
const sitepath = path.join('sites', args[0]);
try {
	if (fs.existsSync(sitepath)) {
		console.log(pc.red('Site already exists - aborting.'));
		process.exit();
	}
} catch {
	console.log(pc.red('Error checking whether the site already exists'));
}

await create(sitepath, {
	name: sitename,
	template: 'skeleton', // or 'skeleton' or 'skeletonlib'
	types: 'typescript', // or 'typescript' or null;
	prettier: true,
	eslint: true,
	playwright: true
});
console.log(pc.green(`Created sites/${sitename}`));
