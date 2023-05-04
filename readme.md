组件的本质是虚拟dom。

设计了vNode，带有tag、data、flag（tag的另一种表示）、children、childFlag（children的另外一种表示）、el（挂载的目）


组件必须要有 render，其实这也是 React 部分的思想，每一个 React 都是继承与一个 基类去实现的。（Vue中的源码和React思路差不多）


【责任重大的渲染器】render：mount + patch。
> 旧node不存在，直接将新dom挂载。
> 如果旧node存在，则对比后挂载。
【渲染周期包含大量的dom操作，控制者组件“生命周期”调用的时机】
【多端渲染的桥梁，自定义渲染器的本质就是把特定平台DOM的方法从核心算法中抽离】
【包含最核心的 Diff 算法】

【chatgpt的一些教学】
- 在Vue.js中，当数据发生变化时，它会触发一个更新循环（update cycle），该循环负责重新渲染组件并更新DOM。该更新循环包含三个主要阶段：虚拟DOM的渲染，比较和打补丁（patch）。
- 当更新循环进入比较阶段时，Vue.js会比较新旧虚拟DOM树的节点差异，并尝试最小化DOM操作的数量，以提高性能。在比较节点差异时，Vue.js会比较节点的标签、属性、事件处理程序、子节点等方面的差异，并将它们记录在一个差异列表（patch list）中。
- 然后，Vue.js会根据差异列表生成一系列打补丁的操作（patching operations），例如添加、删除、移动和更新节点等。在这个过程中，Vue.js会尽可能地重用已存在的DOM元素，而不是重新创建DOM元素，以提高性能。
- 对于节点属性的更新，Vue.js会使用DOM的原生API来更新DOM元素的属性。当然，在特定情况下，Vue.js还可以使用属性拦截器（attribute interceptor）来拦截对节点属性的更改，以实现更高级的功能，例如计算属性（computed properties）或监听属性（watched properties）等

Vue源码中的渲染
```
const { render, _parentVnode } = vm.$options
vnode = render.call(vm._renderProxy, vm.$createElement)
```

Vue中通过vue-loader将template的文件生成虚拟DOM，其中对应的render函数也是vue-loader去实现的。

Vue中通过执行 vnode 本身对象中的 render，让其自己生成一个自己 vnode。