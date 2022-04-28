import ejs from 'ejs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'upath';
import markdown from './markdown';

export default async function generateIndex() {
  const deployDir = join(__dirname, '../docs');
  if (!existsSync(deployDir)) mkdirSync(deployDir);
  const readme = join(__dirname, '../readme.md');
  const html = markdown(readFileSync(readme, 'utf-8'));
  const layout = join(__dirname, 'layout.ejs');
  const rendered = await ejs.renderFile(layout, { content: html });
  writeFileSync(join(deployDir, 'index.html'), rendered);
}
