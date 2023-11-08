/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Children } from './index'
import { mapTypes } from './mapTypes'

/**
 * Creates dom element from a node
 */
export async function render(
    vnode: JSX.Element
): Promise<(HTMLElement | Text)[]> {
    // Handling fragments
    if (Array.isArray(vnode)) {
        return (await Promise.all(vnode.map((child) => render(child)))).flat()
    }
    if (!vnode.type) {
        return getNodesFromChildren(vnode.props.children)
    }
    // Handling components
    if (typeof vnode.type === 'function') {
        return render(await vnode.type(vnode.props))
    }

    const el: HTMLElement = document.createElement(vnode.type)
    const children = await getNodesFromChildren(vnode.props.children)
    children.forEach((child) => el.appendChild(child))

    applyAttributes(vnode, el)

    return [el]
}

const getNodesFromChildren = async (children: Children) => {
    return await mapTypes<Text | HTMLElement>(children, {
        vnode: async (child) => {
            return await render(child)
        },
        catch: (child) => {
            if (child === undefined || child === null) return
            return document.createTextNode(child.toString())
        },
    })
}

/**
 * Map of elements to their event listeners
 */
const listenersInUse = new WeakMap<
    HTMLElement,
    [string, EventListenerOrEventListenerObject][]
>()

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(vnode: JSX.Element, el: HTMLElement) {
    // Remove old listeners
    if (listenersInUse.has(el)) {
        const oldListeners = listenersInUse.get(el)!
        oldListeners.forEach(([eventType, listener]) => {
            el.removeEventListener(eventType, listener)
        })
        // Remove from listeners in use
        listenersInUse.delete(el)
    }

    // Apply attributes
    Object.entries(vnode.props).forEach(([key, value]) => {
        if (key === 'children') return
        // We want to call ref and dangerouslySetInnerHTML at the end
        if (key === 'ref') return
        if (key === 'dangerouslySetInnerHTML') return
        if (value === undefined) return
        if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                el.style[styleKey as any] =
                    typeof styleValue === 'number'
                        ? `${styleValue}px`
                        : styleValue === null
                        ? ''
                        : (styleValue as any)
            })
            return
        }
        if (key.startsWith('on') && typeof value === 'function') {
            const eventType = key.slice(2).toLowerCase()
            const event = value as unknown as EventListener

            el.addEventListener(eventType, event)

            // Add to listeners in use for cleanup next time
            if (!listenersInUse.has(el)) {
                listenersInUse.set(el, [[eventType, event]])
            } else {
                listenersInUse.get(el)!.push([eventType, event])
            }
            return
        }
        // Generic set attribute
        if (value !== null && value !== false) {
            el.setAttribute(key, value)
        } else {
            el.removeAttribute(key)
        }
    })

    // Call ref
    if (vnode.props.ref) vnode.props.ref(el)

    // Handle dangerouslySetInnerHTML
    if (vnode.props.dangerouslySetInnerHTML) {
        el.innerHTML = vnode.props.dangerouslySetInnerHTML.__html
    }
}
