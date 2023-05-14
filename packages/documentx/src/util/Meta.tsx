import { render } from '../render'

export interface BasicMeta {
    title?: string
    description?: string
    noSuffix?: boolean
    noPrefix?: boolean
}

export interface Options {
    prefix?: string
    suffix?: string
}

export class Meta {
    current: JSX.Element[] = []

    constructor(public options: Options = { prefix: '', suffix: '' }) {}

    async set(meta: JSX.Element[]) {
        // Store a representation of what we think the meta tags should be for SSR
        this.current = this.current.reduce((acc, el) => {
            if (el.type === 'title') {
                const existing = acc.find((e) => e.type === 'title')
                if (existing) {
                    existing.props = el.props
                    return acc
                }
            } else if (el.type === 'meta') {
                const existing = acc.find(
                    (e) =>
                        e.type === 'meta' &&
                        (e.props as any).name === (el.props as any).name
                )
                if (existing) {
                    existing.props = el.props
                    return acc
                }
            }
            return [...acc, el]
        }, meta)

        if (typeof document === 'undefined') {
            // Don't do anything else on the server
            return
        }

        const head = document.querySelector('head')
        if (!head) return

        const els = await render({ props: { children: meta } })
        els.forEach((el) => {
            if (!(el instanceof HTMLElement))
                throw new Error('Invalid meta element')
            const existing =
                el.nodeName === 'TITLE'
                    ? head.querySelector('title')
                    : head.querySelector(
                          `meta[name="${el.getAttribute('name')}"]`
                      )
            if (existing) {
                existing.replaceWith(el)
            } else {
                head.appendChild(el)
            }
        })
    }

    from(basicMeta: BasicMeta) {
        const tags: JSX.Element[] = []
        if (basicMeta.title) {
            tags.push({
                type: 'title',
                props: {
                    children: [
                        basicMeta.noPrefix ? '' : this.options.prefix,
                        basicMeta.title,
                        basicMeta.noSuffix ? '' : this.options.suffix,
                    ],
                },
            })
        }
        if (basicMeta.description) {
            tags.push({
                type: 'meta',
                props: {
                    name: 'description',
                    content: basicMeta.description,
                } as any,
            })
        }
        return this.set(tags)
    }
}
