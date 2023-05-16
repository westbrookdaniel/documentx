import { Router } from './router'

export function hijackLinks(router: Router) {
    // Hijack all links
    document.querySelectorAll('a').forEach((el) => hijackLink(router, el))

    // Watch for changes to the dom and hijack new or changed links
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                    mutation.addedNodes.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            if (el instanceof HTMLAnchorElement)
                                hijackLink(router, el)
                            el.querySelectorAll('a').forEach((el) =>
                                hijackLink(router, el)
                            )
                        }
                    })
                    break
                case 'attributes': {
                    const el = mutation.target
                    if (el instanceof HTMLElement) {
                        if (el instanceof HTMLAnchorElement)
                            hijackLink(router, el)
                        el.querySelectorAll('a').forEach((el) =>
                            hijackLink(router, el)
                        )
                    }
                }
            }
        })
    })

    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
    })

    return router
}

/**
 * Map of elements to their event listeners
 */
const existingRouterListeners = new WeakMap<
    HTMLElement,
    [string, EventListenerOrEventListenerObject]
>()

const hijackLink = (router: Router, el: HTMLAnchorElement) => {
    // Remove old listener
    // We remove it here in case the target changes, or it changes to an external link
    if (existingRouterListeners.has(el)) {
        const [eventType, listener] = existingRouterListeners.get(el)!
        el.removeEventListener(eventType, listener)
        // Remove from map
        existingRouterListeners.delete(el)
    }

    const click = (e: Event) => {
        const href = el.getAttribute('href')!
        if (!el.target && href?.startsWith('/')) {
            e.preventDefault()
            router.history.push(href)
        }
    }
    el.addEventListener('click', click)

    // Add to map
    existingRouterListeners.set(el, ['click', click])
}
