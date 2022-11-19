import fs from 'fs-extra';
import path from 'path'

// copy package.json for version info
fs.copyFile('package.json', 'dist/package.json')

//copy template
let dirs = [];
const srcDir = '../../template-sites/';
const destDir = './dist/templates/'
dirs = fs.readdirSync(srcDir)
dirs.forEach((val) => {
	const copyFrom = path.join(srcDir, val, 'src');
	const copyTo = path.join(destDir, val);
	fs.copySync(copyFrom, copyTo, { overwrite: true });
})