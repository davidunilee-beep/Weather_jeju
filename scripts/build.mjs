import { readFile, mkdir, writeFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/styles.css': ['styles.css', 'text/css; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'] };
const assets = {};
for (const [path, [file, type]] of Object.entries(files)) assets[path] = { body: await readFile(new URL('../public/' + file, import.meta.url), 'utf8'), type };
await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/.openai/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/server/index.js', import.meta.url), 'const assets = ' + JSON.stringify(assets) + ';\n' + await readFile(new URL('../worker/index.js', import.meta.url), 'utf8'));
await writeFile(new URL('../dist/.openai/hosting.json', import.meta.url), await readFile(new URL('../.openai/hosting.json', import.meta.url)));
console.log('Built Worker and embedded HTML/CSS/JavaScript assets.');
