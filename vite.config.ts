import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

// Injects integrity="sha384-..." (Sub Resource Integrity) into dist/index.html
// for every hashed /assets file so the browser verifies the bytes it runs.
const sriInjector = (): Plugin => ({
  name: 'sri-injector',
  apply: 'build',
  writeBundle() {
    const htmlPath = join('dist', 'index.html')
    let html = readFileSync(htmlPath, 'utf8')
    const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1])
    for (const ref of refs) {
      const hash = createHash('sha384').update(readFileSync(join('dist', ref.slice(1)))).digest('base64')
      const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      html = html.replace(new RegExp(`((?:src|href)="${escaped}")`), `$1 integrity="sha384-${hash}"`)
    }
    writeFileSync(htmlPath, html)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sriInjector(),
  ],
})