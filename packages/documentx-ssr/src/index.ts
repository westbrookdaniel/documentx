import type { Router, Meta } from 'documentx/util'

declare global {
    var router: Router
    var meta: Meta
}

export function register({ router, meta }: { router: Router; meta: Meta }) {
    globalThis.router = router
    globalThis.meta = meta
}
