import fs from 'fs-extra';
import path from 'path'

//copy template
let dirs = [];
console.log(process.cwd());

const srcDir = '../../template-sites/';
const destDir = 'dist/templates/'
dirs = fs.readdirSync(srcDir)
dirs.forEach((val) => {
	fs.copySync(path.join(srcDir, val, 'src'), path.join(destDir, val, 'src'), { overwrite: true });
	fs.copySync(path.join(srcDir, val, 'static'), path.join(destDir, val, 'static'), { overwrite: true });
	fs.copySync(path.join(srcDir, val, 'meta.json'), path.join(destDir, val, 'meta.json'), {overwrite: true});
})

// fs.readdirSync(dist(templateDir)).forEach((dir) => {
// 	const meta_file = dist(`${templateDir}/${dir}/meta.json`);
// 	const { position, title, description, enabled } = JSON.parse(fs.readFileSync(meta_file, 'utf8'));
// 	if (enabled) {
// 		parsedChoices.push({
// 			position,
// 			title,
// 			description,
// 			value: dir
// 		});
// 	}
// });
fs.copySync('package.json', 'dist/package.json');