
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
// 本文章仅为了研究 diff 算法，所以 node-type 仅为 ul、li(html元素)
// 不考虑除了ul、li以外的元素
// 不考虑vnode中的样式、事件

const CHILDREN_FLAG = {
    NO_CHILD: 0,
    SINGLE_CHILD: 1,
    MULTI_CHILD: 1 << 1
};
/**
 * 用 vNode 描述真实 DOM
 * @param {string} tag - 元素标签类型
 * @param {string} data - 元素标签内容
 * @param {array} children - 元素子节点
 * @returns tag, data, children, childrenFlag, key
 */
class VNode {
    constructor({tag, data, key, children = []}) {
        let childFlag;
        let len = children.length;
        if (len) {
            childFlag = len > 1 ? CHILDREN_FLAG.MULTI_CHILD : CHILDREN_FLAG.SINGLE_CHILD;
        } else {
            childFlag = CHILDREN_FLAG.NO_CHILD;
        }
        return {
            tag,
            data,
            key,
            children,
            childFlag
        }
    }
}

const mountEle = (container, node) => {
    if (!container || !node) {
        return
    }
    const tag = node.tag;
    const el = document.createElement(tag);
    el.innerText = node.data || '';
    // 判断是否有子节点需要挂载
    const len = node.children.length;
    if (len) {
        for (let i = 0; i < len; i++) {
            mountEle(el, node.children[i]);
        }
    }
    container.$el = el;
    container.appendChild(el);
};

// 对比diff算法的入口
const patch = (oldNode, newNode) => {

};

const render = (container, newNode) => {
    // 这里由于我们只有ele，为了专心研究diff；
    // 其实这里还有一层关于 dom 的类型判断（判断svg、html、portal、component节点的区别）
    if (container.node) {
        // 如果存在旧节点 + 新节点
        if (newNode) {
            patch(container.node);
            container.node = newNode;
        } else {
            // 有旧节点 + 没有新节点 => （说明要删除节点了）
            container.removeChild(container.$el);
            container.node = null;
        }
    } else {
        // 如果不存在旧节点
        if (newNode) {
            mountEle(container, newNode);
            container.node = newNode;
        }
        // 如果新节点也不存在
        // do nothing.
    }
};

console.log('CHILDREN_FLAG', CHILDREN_FLAG);

// 目标：创建真实 dom ul - li*5

// 5个li节点
const arr = 'ABCDE';
var liMap = {};
for (let i = 0; i < arr.length; i++) {
    liMap[i] = new VNode({
        tag: 'li',
        key: arr[i],
        data: `${arr[i]}`
    });
}
// ul外层节点 + 5个li节点【旧的】
var oldNode = new VNode({
    tag: 'ul',
    children: [
        ...Array(5).fill('').map((item, index) => liMap[index])
    ]
});
const oRoot = document.getElementById('root');

render(oRoot, oldNode);

// 如果说新的顺序是 'EABDC'
