import mountElement from './mountElement'
import updateTextNode from './updateTextNode'
import updateNodeElement from './updateNodeElement'
import createDOMElement from './createDOMElement'
import unmountNode from './unmountNode'
import diffComponent from './diffComponent'

export default function diff (virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM
  const oldComponent = oldVirtualDOM && oldVirtualDOM.component
  // 判断 oldDOM 是否存在
  if (!oldDOM) {
    mountElement(virtualDOM, container)
  } else if (
    // 如果要对比的两个节点类型不同
    virtualDOM.type !== oldVirtualDOM.type &&
    // 并且节点的类型不是组件，因为组件要单独维护
    typeof virtualDOM.type !== 'function'
  ) {
    // 生成新的 DOM 对象替换老的 DOM 对象
    const newElement = createDOMElement(virtualDOM)
    oldDOM.parentNode.replaceChild(newElement, oldDOM)
  } else if (typeof virtualDOM.type === 'function') {
    // 组件
    diffComponent(virtualDOM, oldComponent, oldDOM, container)
  } else if (oldVirtualDOM && oldVirtualDOM.type === oldVirtualDOM.type){
    if (oldVirtualDOM.type === 'text') {
      // 更新内容
      updateTextNode(virtualDOM, oldVirtualDOM, oldDOM)
    } else {
      // 更新元素属性
      updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
    }

    // 1. 将拥有 key 属性的子元素放置在一个单独的对象中
    let keyedElements = {}
    for (let i = 0, len = oldDOM.childNodes.length; i < len; i++) {
      let domElement = oldDOM.childNodes[i]
      if (domElement.nodeType === 1) { // 元素节点，才可以获取 key 属性
        let key = domElement.getAttribute('key')
        if (key) {
          keyedElements[key] = domElement
        }
      }
    }

    let hasNoKey = Object.keys(keyedElements).length === 0
    if (hasNoKey) {
      // 对比子节点
      virtualDOM.children.forEach((child, i) => {
        diff(child, oldDOM, oldDOM.childNodes[i])
      })
    } else {
      // 2. 循环要渲染的 virtualDOM 的子元素，获取子元素的 key 属性
      virtualDOM.children.forEach((child, i) => {
        let key = child.props.key
        let domElement = keyedElements[key]
        if (domElement) { // dom 元素已存在，不需要重新渲染
          // 3. 看看当前位置的元素是不是我们期望的元素
          if (oldDOM.childNodes[i] && oldDOM.childNodes[i] !== domElement) {
            oldDOM.insertBefore(domElement, oldDOM.childNodes[i])
          }
        } else {
          // 新增元素
          mountElement(child, oldDOM, oldDOM.childNodes[i])
        }
      })
    }

    // 删除节点
    // 获取旧节点
    let oldChildNodes = oldDOM.childNodes
    // 判断旧节点的数量
    if (oldChildNodes.length > virtualDOM.children.length) {
      // 有节点需要被删除
      if (hasNoKey) {
        for (let i = oldChildNodes.length - 1; i > virtualDOM.children.length - 1; i--) {
          unmountNode(oldChildNodes[i])
        }
      } else {
        // 通过 key 属性删除节点
        for (let i = 0; i < oldChildNodes.length; i++) {
          const oldChild = oldChildNodes[i]
          let oldChildKey = oldChild._virtualDOM.props.key
          if (virtualDOM.children.findIndex(newChild => newChild.props.key === oldChildKey) === -1) {
            unmountNode(oldChild)
          }
        }
      }
    }
  }
}