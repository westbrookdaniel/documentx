import type { Child, Children, VNode } from '.'

/**
 * Creates dom element from a node
 */
export function render(vnode: VNode): Element {
  if (typeof vnode.type === 'function') {
    return render(vnode.type(vnode.props))
  }

  const el: Element = document.createElement(vnode.type)

  const children = vnode.props.children
  if (children) {
    mapTypes(children, {
      vnode: (child) => {
        el.appendChild(render(child))
      },
      catch: (child) => {
        if (child === undefined || child === null) return
        el.appendChild(document.createTextNode(child.toString()))
      },
    })
  }

  applyAttributes(vnode, el)

  return el
}

/**
 * Map of elements to their event listeners
 * TODO: Add some manual cleanup for listeners when the element is removed?
 */
const listenersInUse = new WeakMap<
  Element,
  [string, EventListenerOrEventListenerObject][]
>()

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(vnode: VNode, el: Element) {
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
  // Any code that modifies the dom will be run too
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === 'children') return
    // We want to apply ref at the end
    if (key === 'ref') return
    if (value === undefined) return
    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase()

      // TODO: Type props so we don't need this cast
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
    // TODO: Fix this cast
    el.setAttribute(key, value as any)
  })

  // Apply ref
  if (vnode.props.ref) vnode.props.ref(el)
}

/**
 * Maps over the children of a node
 */
function mapTypes(
  children: Children,
  handlers: {
    vnode?: (child: VNode) => void
    catch?: (child: Exclude<Child, VNode>) => void
  }
) {
  if (Array.isArray(children)) {
    children.flat().forEach((child) => {
      // TODO: Use symbol to check if it's a vnode
      if (typeof child === 'object') {
        handlers.vnode?.(child as unknown as VNode)
      } else {
        handlers.catch?.(child)
      }
    })
  } else if (typeof children === 'object') {
    // TODO: Use symbol to check if it's a vnode
    handlers.vnode?.(children as unknown as VNode)
  } else {
    handlers.catch?.(children)
  }
}
