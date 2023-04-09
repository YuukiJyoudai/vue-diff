// 目标：创建真实 dom ul - li*5
import {VNode} from './src/dom'
import { render } from './src/render'

// 5个li节点
var liMap = {}
for (let i = 0; i < 5; i++) {
    liMap[i] = new VNode({
        tag: 'li',
        key: i,
        data: `我是第${i}个节点`
    })
}
// ul外层节点 + 5个li节点【旧的】
var oldNode = new VNode({
    tag: 'ul',
    children: [
        ...Array(5).fill('').map((item, index) => liMap[index])
    ]
})
const oRoot = document.getElementById('root')

render(oRoot, oldNode)
