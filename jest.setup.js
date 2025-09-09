import path from 'path';
import { getChecksum } from 'sbg-utility';
import fs from 'fs';
import { spawnSync } from 'child_process';

const currentChecksum = getChecksum(path.join(process.cwd(), 'package.json'));
const checksumFile = path.join(process.cwd(), 'tmp/jest/checksum.txt');
if (!fs.existsSync(path.dirname(checksumFile))) {
  fs.mkdirSync(path.dirname(checksumFile), { recursive: true });
}
const previousChecksum = fs.existsSync(checksumFile) ? fs.readFileSync(checksumFile, 'utf-8') : '';

if (currentChecksum !== previousChecksum) {
  spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log(`Checksum changed: ${previousChecksum} -> ${currentChecksum}`);
  fs.writeFileSync(checksumFile, currentChecksum, 'utf-8');
}
