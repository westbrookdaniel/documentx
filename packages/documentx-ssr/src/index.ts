import type { Meta } from 'documentx/dist/util/Meta'
import type { Router } from 'documentx/dist/util/router'

declare global {
    var router: Router
    var meta: Meta
}

export function register({ router, meta }: { router: Router; meta: Meta }) {
    globalThis.router = router
    globalThis.meta = meta
}
