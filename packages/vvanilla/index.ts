export const VERSION = '1.0.0'

declare global {
  namespace JSX {
    interface Element {
      type: any
      props: any
    }

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
      [elemName: string]: any
    }
  }
}
