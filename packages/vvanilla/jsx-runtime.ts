function jsx(type: any, props: any) {
  return { type, props }
}

function Fragment(props: any) {
  return props.children
}

export { jsx, jsx as jsxs, Fragment }

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
