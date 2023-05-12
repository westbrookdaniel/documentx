#!/usr/bin/env node

import cac from 'cac'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const cli = cac('documentx-ssr')

cli.command('dev', 'Start dev server').action(async () => {
    process.env.NODE_ENV = 'dev'
    await import(path.resolve(__dirname, './index.js'))
})

cli.command('build', 'Build for production').action(async () => {
    exec('tsc && vite build && vite build --ssr')
    // move our index.js to their dist
    fs.copyFileSync(path.resolve(__dirname, 'index.js'), 'dist/index.js')
})

cli.command('preview', 'Preview production build').action(async () => {
    exec('node dist')
})
