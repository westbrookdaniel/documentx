import { render } from '../render'
import { Reference } from './ref'
import { getTarget } from './getTarget'

/**
 * Utility for handling async rendering
 */
export const renderAsync = (
    el: Reference | { target: HTMLElement },
    options: {
        loading: () => JSX.Element
        error: (err: unknown) => JSX.Element
        data: () => Promise<JSX.Element>
    }
) => {
    options
        .data()
        .then((d) => render(d))
        .then((children) => {
            getTarget(el).replaceChildren?.(...children)
        })
        .catch(async (err) => {
            const children = await render(options.error(err))
            getTarget(el)?.replaceChildren?.(...children)
        })
    return options.loading()
}
