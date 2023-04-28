import type { VNode } from 'framework'
import { render } from 'framework'

export type BasicMeta = {
  title?: string
  description?: string
  image?: string
}

export function setMeta(meta: VNode[]) {
  const head = document.querySelector('head')
  if (!head) return
  meta.forEach((node) => {
    const el = render(node)
    const existing =
      el.nodeName === 'TITLE'
        ? head.querySelector('title')
        : head.querySelector(`meta[name="${el.getAttribute('name')}"]`)
    if (existing) {
      existing.replaceWith(el)
    } else {
      head.appendChild(el)
    }
  })
}

setMeta.from = (meta: BasicMeta) => {
  const tags: VNode[] = []
  if (meta.title) {
    tags.push(<title>{meta.title}</title>)
  }
  if (meta.description) {
    tags.push(<meta name="description" content={meta.description} />)
  }
  if (meta.image) {
    tags.push(<meta name="image" content={meta.image} />)
  }
  return setMeta(tags)
}
