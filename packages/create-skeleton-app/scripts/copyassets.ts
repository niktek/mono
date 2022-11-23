import fs from 'fs-extra';
import path from 'path';

const srcDir = '../../template-sites/';
const destDir = 'templates/';
const dirs = fs.readdirSync(srcDir);
dirs.forEach((val) => {
  const { enabled } = JSON.parse(
    fs.readFileSync(path.join(srcDir, val, 'meta.json'), 'utf8'),
  );
  if (!enabled) return;
  fs.copySync(path.join(srcDir, val, 'src'), path.join(destDir, val, 'src'), {
    overwrite: true,
  });
  fs.copySync(
    path.join(srcDir, val, 'static'),
    path.join(destDir, val, 'static'),
    { overwrite: true },
  );
  fs.copySync(
    path.join(srcDir, val, 'meta.json'),
    path.join(destDir, val, 'meta.json'),
    { overwrite: true },
  );
});
