// 目标：创建真实 dom ul - li*5
import { VNode } from './src/dom'
import { render } from './src/render'
// 5个li节点
const arr = 'ABCDE'
var liMap = {}
for (let i = 0; i < arr.length; i++) {
    liMap[i] = new VNode({
        tag: 'li',
        key: arr[i],
        data: `${arr[i]}`
    })
}
const oldList = [...Array(5).fill('').map((item, index) => liMap[index])]
// ul外层节点 + 5个li节点【旧的】
var oldNode = new VNode({
    tag: 'ul',
    children: oldList
})
const oRoot = document.getElementById('root')
// 使用 mutationObserver 查看 dom 操作的事件
const observer = new MutationObserver((mutationList) => {
    console.log('mutationList', mutationList)
})

observer.observe(oRoot, {
    // 监听属性值的变化
    attributes: true,
    // 监听节点的新增与删除
    childList: true,
    // 以 target 为根节点的整个子树
    subtree: true
})

render(oRoot, oldNode)

// 如果说新的顺序是 'EABDC'
// 乱序函数
const sort = (str, arr) => {
    const res = [].concat(arr)
    return res.sort((a, b) => {
        const keyPre = str.indexOf(a.key)
        const keyNext = str.indexOf(b.key)
        // 为负值的则在前面
        return keyPre - keyNext
    })
}

// 从 ABCED 变为 EABDC
const newList = sort('EABDC', oldList)
const newNode = new VNode({
    tag: 'ul',
    children: newList
})

// 替换 DOM 的入口
setTimeout(() => {
    performance.mark('start')
    render(oRoot, newNode)
    setTimeout(() => {
        performance.mark('end')
        console.log(performance.measure('test', 'start', 'end'))
    }, 0)
}, 500)