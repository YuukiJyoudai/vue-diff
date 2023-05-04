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
// render主体函数
export const render = (container, newNode) => {
    if (container.node) {
        if (newNode) {
            // 1.旧节点存在，新节点存在【对比更新】
            container.removeChild(container.node.$el)
            mount(container, newNode)
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