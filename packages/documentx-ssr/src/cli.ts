#!/usr/bin/env node

import cac from 'cac'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { exec as _exec } from 'child_process'

const exec = util.promisify(_exec)

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const cli = cac('documentx-ssr')

cli.command('dev', 'Start dev server').action(async () => {
    process.env.NODE_ENV = 'dev'
    await import(path.resolve(__dirname, './server-dev.js'))
})

cli.command('build', 'Build for production').action(async () => {
    console.log('Building...')

    // clean out dir
    fs.rmSync(path.resolve(process.cwd(), 'dist'), { recursive: true })

    // type check, build client and server
    const { stderr, stdout } = await exec(
        'tsc && vite build && vite build --ssr'
    )

    if (stderr) console.error(stderr)
    console.log(stdout)

    // move our server to their dist
    fs.copyFileSync(
        path.resolve(__dirname, 'server.js'),
        path.resolve(process.cwd(), 'dist/index.js')
    )
})

cli.help()

cli.parse()
