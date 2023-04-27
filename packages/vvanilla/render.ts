import type { Child, Children, VNode } from '.'

/**
 * Creates dom element from a node
 */
export function render(
  parentElement: Element | undefined | null,
  vnode: VNode
): Element {
  // If it's a component call it's render function
  if (typeof vnode.type === 'function') {
    return render(parentElement, vnode.type(vnode.props))
  }

  // TODO: Add optimisation around reusing dom elements
  const el: Element = document.createElement(vnode.type)
  parentElement?.replaceChildren(el)

  applyAttributes(vnode, el)

  const children = vnode.props.children
  const newChildren: (Element | Text)[] = []
  if (children) {
    traverse(children, {
      vnode: (child, i) => {
        newChildren.push(
          render(parentElement?.children[i ?? 0] as Element, child)
        )
      },
      catch: (child) => {
        if (child === undefined || child === null) return
        newChildren.push(document.createTextNode(child.toString()))
      },
    })
  }
  el.replaceChildren(...newChildren)

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
 * Traverses children of a node
 */
function traverse(
  children: Children,
  handlers: {
    vnode?: (child: VNode, i?: number) => void
    catch?: (child: Exclude<Child, VNode>, i?: number) => void
  }
) {
  if (Array.isArray(children)) {
    children.flat().forEach((child, i) => {
      // TODO: Use symbol to check if it's a vnode
      if (typeof child === 'object') {
        handlers.vnode?.(child as unknown as VNode, i)
      } else {
        handlers.catch?.(child, i)
      }
    })
  } else if (typeof children === 'object') {
    // TODO: Use symbol to check if it's a vnode
    handlers.vnode?.(children as unknown as VNode)
  } else {
    handlers.catch?.(children)
  }
}
