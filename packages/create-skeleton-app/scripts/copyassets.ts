import fs from 'fs-extra';
import path from 'path'

//copy template
let dirs = [];
console.log(process.cwd());

const srcDir = '../../template-sites/';
const destDir = '../../packages/create-skeleton-app/dist/templates/'
dirs = fs.readdirSync(srcDir)
dirs.forEach((val) => {
	const copyFrom = path.join(srcDir, val, 'src');
	const copyTo = path.join(destDir, val);
	fs.copySync(copyFrom, copyTo, { overwrite: true });
})

fs.copySync('package.json', 'dist/package.json');