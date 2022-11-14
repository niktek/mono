import fs from 'fs-extra';
fs.copySync('templates/', 'dist/templates/')
fs.copyFile('package.json', 'dist/package.json')