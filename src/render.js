// render之mount函数
export const mount = (container, node) => {
    if (!container || !node) {
        return
    }
    const tag = node.tag
    const el = document.createElement(tag)
    el.innerText = node.data || ''
    // 判断是否有子节点需要挂载
    const len = node.children.length
    if (len) {
        for (let i = 0; i < len; i++) {
            mount(el, node.children[i])
        }
    }
    node.$el = el
    container.appendChild(el)
}
// render之patch
const _isSameNode = (oldN, newN) => {
    return oldN.key === newN.key && oldN.tag === newN.tag
}
const patch = (oldN, newN, container) => {
    container.node = newN
    // 预处理，不是相同的，直接 remove + mount 就可以了
    if (!_isSameNode(oldN, newN)) {
        container.removeChild(container.$el)
        mount(container, newN)
        return
    }
    const el = newN.$el = oldN.$el
    // 更新data
    if (oldN.data !== newN.data) {
        el.innerText = newN.data
    }
    // 这里对于children不使用diff，直接批量删除、批量添加【不进行复用】
    for (let i = 0; i < oldN.children.length; i++) {
        el.removeChild(oldN.children[i].$el)
    }
    for (let i = 0; i < newN.children.length; i++) {
        mount(el, newN.children[i])
    }
}
// render主体函数
export const render = (container, newNode) => {
    if (container.node) {
        if (newNode) {
            // 1.旧节点存在，新节点存在【对比更新】
            patch(container.node, newNode, container)
            // 更新children
            container.node = newNode
        } else {
            // 2.旧节点存在，新节点不存在【删除】
            container.removeChild(container.$el)
            container.node = null
        }
    } else {
        if (newNode) {
            // 3.旧节点不存在，新节点存在【新增】
            mount(container, newNode)
            container.node = newNode
        } else {
            // 4.旧节点不存在，新节点不存在【nothing】
        }
    }
}