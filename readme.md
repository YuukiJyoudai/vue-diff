### 实践理解Vue-Diff


* rollup - 打包方式
* vdom - 虚拟dom简单版本
* render - 将虚拟dom渲染为真实dom
    * diff - 核心diff算法（处于 render 的子文件中）
* legend - 开始文件（Main），用于测试


### 【目标】对比实例

ul li * 5

ul li * 5


### 分析
> 什么时候开始进行虚拟DOM的 Diff 对比

Vue是数据驱动的。
当数据中的 5个 li 位置改变了。
数据的改动 => 映射为虚拟 Dom 的改变。
虚拟 DOM 的改变 => 在这个时候通过 Diff 算法去决定 => 【以最小的代价更新DOM】
【意味着这个仓库其实还应该有对实体dom-el的引用】

【由于本仓库的目的是为了探究 Vue Diff，先排除掉 Vue 的响应式等相关内容。】