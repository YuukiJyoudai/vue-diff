// 目标：创建真实 dom ul - li*5
import {VNode} from './src/dom'
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
// ul外层节点 + 5个li节点【旧的】
var oldNode = new VNode({
    tag: 'ul',
    children: [
        ...Array(5).fill('').map((item, index) => liMap[index])
    ]
})
const oRoot = document.getElementById('root')

render(oRoot, oldNode)

// 如果说新的顺序是 'EABDC'
