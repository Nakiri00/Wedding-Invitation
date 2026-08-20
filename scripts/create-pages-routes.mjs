import {
  copyFile,
  mkdir,
} from 'node:fs/promises';

import path from 'node:path';

const distDirectory = path.resolve('dist');
const routes = ['admin', 'staff'];

for (const route of routes) {
  const routeDirectory = path.join(
    distDirectory,
    route,
  );

  await mkdir(routeDirectory, {
    recursive: true,
  });

  await copyFile(
    path.join(distDirectory, 'index.html'),
    path.join(routeDirectory, 'index.html'),
  );
}

console.log(
  'Created GitHub Pages routes:',
  routes.join(', '),
);