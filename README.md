 ## 1. 请简述 React 16 版本中初始渲染的流程

  >要将 React 元素渲染到页面中，分为两个阶段，render 阶段和 commit 阶段。
  >render 阶段负责创建 Fiber 数据结构并为 Fiber 节点打标记，标记当前 Fiber 节点要进行的 DOM 操作。
  >commit 阶段负责根据 Fiber 节点标记 ( effectTag ) 进行相应的 DOM 操作。


  ## 2. 为什么 React 16 版本中 render 阶段放弃了使用递归

  >React 16 之前的版本比对更新 VirtualDOM 的过程是采用循环加递归实现的，这种比对方式有一个问题，就是一旦任务开始进行就无法中断，如果应用中组件数量庞大，主线程被长期占用，直到整棵 VirtualDOM 树比对更新完成之后主线程才能被释放，主线程才能执行其他任务。这就会导致一些用户交互，动画等任务无法立即得到执行，页面就会产生卡顿, 非常的影响用户体验。

  >核心问题：递归无法中断，执行重任务耗时长。 JavaScript 又是单线程，无法同时执行其他任务，导致任务延迟页面卡顿，用户体验差。

  ## 3. 请简述 React 16 版本中 commit 阶段的三个子阶段分别做了什么事情

  ```text
  (1)before mutation阶段（执行DOM操作前）:
    1.处理DOM节点渲染/删除后的 autoFocus、blur逻辑
    2.调用getSnapshotBeforeUpdate生命周期钩子
    3.调度useEffect

  (2)mutation阶段（执行DOM操作）:
    1.根据ContentReset effectTag重置文字节点
    2.更新ref
    3.根据effectTag分别处理，其中effectTag包括(Placement | Update | Deletion | Hydrating)
    4.Placement时：
    获取父级DOM节点。其中finishedWork为传入的Fiber节点
    获取Fiber节点的DOM兄弟节点
    根据DOM兄弟节点是否存在决定调用parentNode.insertBefore或parentNode.appendChild执行DOM插入操作
    5.Update时：
    执行所有useLayoutEffect hook的销毁函数。
    调用commitWork
    6.Deletion时：
    递归调用Fiber节点及其子孙Fiber节点中fiber.tag为ClassComponent的componentWillUnmount (opens new window)生命周期钩子，从页面移除Fiber节点对应DOM节点
    解绑ref
    调度useEffect的销毁函数

  (3)layout
    1.调用componentDidxxx
    2.调用this.setState第二个参数回调函数
    3.调用useLayoutEffect hook的回调函数(与mutation的销毁函数是同步的)，调度useEffect的销毁与回调函数(在before mutation只是先调度加入异步任务，在这里才真正执行),因此useLayoutEffect是同步的，useEffect是异步的
    4.获取DOM实例，更新ref
    5.current Fiber树切换(workInProgress Fiber树在commit阶段完成渲染后会变为current Fiber树)
  ```

  ## 4. 请简述 workInProgress Fiber 树存在的意义是什么

  >React 使用双缓存技术完成 Fiber 树的构建与替换，实现DOM对象的快速更新。

  >在 React 中最多会同时存在两棵 Fiber 树，当前在屏幕中显示的内容对应的 Fiber 树叫做 current Fiber 树，当发生更新时，React 会在内存中重新构建一颗新的 Fiber 树，这颗正在构建的 Fiber 树叫做 workInProgress Fiber 树。在双缓存技术中，workInProgress Fiber 树就是即将要显示在页面中的 Fiber 树，当这颗 Fiber 树构建完成后，React 会使用它直接替换 current Fiber 树达到快速更新 DOM 的目的，因为 workInProgress Fiber 树是在内存中构建的所以构建它的速度是非常快的。

  >一旦 workInProgress Fiber 树在屏幕上呈现，它就会变成 current Fiber 树。

  >在 current Fiber 节点对象中有一个 alternate 属性指向对应的 workInProgress Fiber 节点对象，在 workInProgress Fiber 节点中有一个 alternate 属性也指向对应的 current Fiber 节点对象。