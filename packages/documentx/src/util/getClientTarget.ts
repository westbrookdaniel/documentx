import { Reference } from './ref'

/**
 * Only get the target on the client
 */
export const getClientTarget = (
    e: Reference | { target: HTMLElement }
): Partial<HTMLElement> => {
    if (typeof window === 'undefined') return {}
    if (!('target' in e))
        throw new Error(
            'Invalid reference, maybe you tried to use it before the initial render?'
        )
    return e.target
}
