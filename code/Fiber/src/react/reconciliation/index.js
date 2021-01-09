import { arrified, createTaskQueue, createStateNode, getTag, getRoot } from "../Misc"
import { updateNodeElement } from "../Misc/DOM"

const taskQueue = createTaskQueue()

let subTask = null

let pendingCommit = null

const commitAllWork = fiber => {
  // 循环 effects 数组，构建 DOM 节点树
  fiber.effects.forEach(item => {
    if (item.tag === 'class_component') {
      // 备份组件的 fiber 对象
      item.stateNode.__fiber = item
    }
    if (item.effectTag === 'delete') {
      item.parent.stateNode.removeChild(item.stateNode)
    } else if (item.effectTag === 'update') {
      // 更新
      if (item.type === item.alternate.type) {
        // 节点类型相同
        updateNodeElement(item.stateNode, item, item.alternate)
      } else {
        // 节点类型不同，不需要匹配，直接替换老节点
        item.parent.stateNode.replaceChild(
          item.stateNode,
          item.alternate.stateNode
        )
      }
    } else if (item.effectTag === 'placement') {
      let fiber = item
      let parentFiber = item.parent
      while (parentFiber.tag === 'class_component' || parentFiber.tag === 'function_component') {
        parentFiber = parentFiber.parent
      }
      if (fiber.tag === 'host_component') {
        parentFiber.stateNode.appendChild(fiber.stateNode)
      }
    }
  })
  // 备份旧的 fiber 节点
  fiber.stateNode.__rootFiberContainer = fiber
}

const getFirstTask = () => {
  // 从任务队列中获取任务
  const task = taskQueue.pop()
  pendingCommit = null // 优化
  if (task.from === 'class_component') {
    const root = getRoot(task.instance)
    task.instance.__fiber.partialState = task.partialState
    return {
      props: root.props,
      stateNode: root.stateNode, // 别写错了这里
      tag: 'host_root',
      effects: [],
      child: null,
      alternate: root
    }
  }
  // 返回最外层节点的 fiber 对象
  return {
    type: null, // 节点类型（元素、文本、组件）（具体的类型）
    props: task.props, // 节点属性
    stateNode: task.dom, // 节点 DOM 对象 | 组件实例对象
    tag: 'host_root', // 节点标记 ['hostRoot', 'hostComponent', 'classComponent', 'FunctionComponent']
    effects: [], // 数组，存储需要更改的 fiber 对象
    effectTag: null, // 当前 fiber 对象要被执行的操作（新增、删除、修改）
    parent: null, // 当前 fiber 的父级 fiber
    child: null, // 当前 fiber 的子级 fiber
    sibling: null, // 当前 fiber 的下一个兄弟 fiber
    alternate: task.dom.__rootFiberContainer, // fiber 备份 fiber 比对时使用
  }
}

const reconcileChildren = (fiber, children) => {
  // children 可能是对象，可能是数组。将 children 转化成数组
  const arrifiedChildren = arrified(children)
  let index = 0
  let numberOfElements = arrifiedChildren.length
  let element = null
  let newFiber = null
  let prevFiber = null
  let alternate = null
  if (fiber.alternate && fiber.alternate.child) { // fiber.alternate.child 为 fiber 的第一个子节点的备份节点
    alternate = fiber.alternate.child
  }
  while (index < numberOfElements || alternate) {
    // 子节点 virtualDOM 对象
    element = arrifiedChildren[index]
    if (!element && alternate) {
      // 删除操作
      alternate.effectTag = 'delete'
      fiber.effects.push(alternate)
    }else if (element && alternate) {
      // 更新操作
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: 'update', // 'update', 'deletion'
        stateNode: null, // dom 对象
        parent: fiber,
        alternate
      }

      if (element.type === alternate.type) {
        // 类型相同
        newFiber.stateNode = alternate.stateNode
      } else {
        // 类型不同
        // 为 fiber 节点添加 DOM 对象或者组件实例对象
        newFiber.stateNode = createStateNode(newFiber)
      }
    } else if (element && !alternate) {
      // 初始渲染
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: 'placement', // 'update', 'deletion'
        stateNode: null, // dom 对象
        parent: fiber
      }
      // 为 fiber 节点添加 DOM 对象或者组件实例对象
      newFiber.stateNode = createStateNode(newFiber)
    }
    // 只有第一个子节点是父节点的 child,后面的子节点是前一个子节点的兄弟节点
    if (index === 0) {
      // 为父级 fiber 添加子级 fiber 
      fiber.child = newFiber
    } else if (element) {
      // 为 fiber 添加下一个兄弟 fiber 
      prevFiber.sibling = newFiber
    }
    if (alternate && alternate.sibling) {
      alternate = alternate.sibling
    } else {
      alternate = null
    }
    prevFiber = newFiber
    index++
  }
}

const executeTask = fiber => {
  // 构建子级对象
  if (fiber.tag === 'class_component') {
    // 更新 state
    if (fiber.stateNode.__fiber && fiber.stateNode.__fiber.partialState) {
      fiber.stateNode.state = {
        ...fiber.stateNode.state,
        ...fiber.stateNode.__fiber.partialState
      }
    }
    reconcileChildren(fiber, fiber.stateNode.render())
  } else if (fiber.tag === 'function_component') {
    reconcileChildren(fiber, fiber.stateNode(fiber.props))
  } else {
    reconcileChildren(fiber, fiber.props.children)
  }
  
  // 如果子级存在，返回子级，将这个子级作为父级，构建这个父级下的子级
  if (fiber.child) {
    return fiber.child
  }

  let currentExecutelyFiber = fiber

  while (currentExecutelyFiber.parent) {
    currentExecutelyFiber.parent.effects = currentExecutelyFiber.parent.effects.concat(
      currentExecutelyFiber.effects.concat([currentExecutelyFiber])
    )
    if (currentExecutelyFiber.sibling) {
      return currentExecutelyFiber.sibling
    }
    currentExecutelyFiber = currentExecutelyFiber.parent
  }
  pendingCommit = currentExecutelyFiber
  console.log(currentExecutelyFiber)
}

const workLoop = deadline => {
  // 如果子任务不存在，就去获取子任务
  if (!subTask) {
    subTask = getFirstTask()
  }
  // 如果任务存在，并且浏览器有空余时间就调用 executeTask 方法执行任务 接受任务 返回新的任务
  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }
  if (pendingCommit) {
    commitAllWork(pendingCommit)
  }
}

const performTask = deadline => {
  // 执行任务
  workLoop(deadline)
  /**
   * 判断任务是否存在
   * 判断任务队列中是否还有任务没有执行
   * 再一次告诉浏览器在空闲的时间执行任务
   */
  if (subTask || !taskQueue.isEmpty()) { // 还有任务
    requestIdleCallback(performTask)
  }
}

export const render = (element, dom) => {
  /**
   * 1. 向任务队列添加任务
   * 2. 指定在浏览器空闲时执行任务
   */
   /**
    * 任务就是通过 vdom 对象构建 fiber 对象
    */
  taskQueue.push({
    dom,
    props: { children: element }
  })
  requestIdleCallback(performTask)
}

export const scheduleUpdate = (instance, partialState) => {
  taskQueue.push({
    from: 'class_component',
    instance,
    partialState
  })
  requestIdleCallback(performTask)
}