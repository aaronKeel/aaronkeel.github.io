import { defineConfig } from 'vite';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

function getHtmlFiles(dir: string, relativeBase = ''): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
    const absolutePath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && relativePath.endsWith('.html')) {
      files.push(relativePath);
    }
  }

  return files;
}

const pagesDir = resolve(__dirname, 'pages');
const pageInputs = existsSync(pagesDir)
  ? Object.fromEntries(
      getHtmlFiles(pagesDir).map((relativePath) => [
        `pages/${relativePath.replace(/\.html$/, '')}`,
        resolve(pagesDir, relativePath)
      ])
    )
  : {};

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...pageInputs
      }
    }
  }
});
