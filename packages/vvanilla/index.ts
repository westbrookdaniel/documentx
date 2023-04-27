export type VNode = {
  type: any
  props: any & { children: Children[] }
}

export type Children = Child | Child[]

export type Child =
  | VNode[]
  | VNode
  | object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined

declare global {
  namespace JSX {
    interface Element extends VNode {}

    interface IntrinsicElements {
      [elemName: string]: any
    }

    interface ElementAttributesProperty {
      props: any
    }

    interface ElementChildrenAttribute {
      children: any
    }

    interface IntrinsicAttributes {
      [elemName: string]: any & { ref?: (el: Element) => void }
    }
  }
}

export * from './render'
