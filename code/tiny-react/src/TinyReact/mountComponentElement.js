import isFunction from "./isFunction";
import isFunctionComponent from "./isFunctionComponent";
import mountNativeElement from "./mountNativeElement";

export default function mountComponentElement (virtualDOM, container, oldDOM) {
  let nextVirtualDOM = null
  let component = null
  // 判断组件是类组件还是函数组件
  if (isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM)
    component = nextVirtualDOM.component
  }

  // 判断类组件是否有 ref 属性，如果有，调用 ref(component), 传入组件实例
  if (component) {
    component.componentDidMount()
    if (component.props && component.props.ref) {
      component.props.ref(component)
    }
  }

  if (isFunction(nextVirtualDOM)) {
    mountComponentElement(nextVirtualDOM, container, oldDOM)
  } else {
    mountNativeElement(nextVirtualDOM, container, oldDOM)
  }
}

function buildFunctionComponent (virtualDOM) {
  return virtualDOM.type(virtualDOM.props || {}) // 将props传递给函数组件作为参数
}

function buildClassComponent(virtualDOM) {
  const component = new virtualDOM.type(virtualDOM.props || {}) // 将props传递给构造函数
  const nextVirtualDOM = component.render()
  nextVirtualDOM.component = component
  return nextVirtualDOM
}