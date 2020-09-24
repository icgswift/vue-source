class Compile {
    constructor(el, vm, data) {
        this.vm = vm
        this.data = data

        // 获取根节点模板
        this.root = this.isElementNode(el) ? el : document.querySelector(el)
        // console.log(this.root)
        // 将模板内容转到文档碎片
        const fr = this.node2fragment(this.root)
        // 替换fr中的数据 会使用vm中methods所以只传递data不合适
        this.compile(fr, vm)
        // 放回到根节点
        this.root.appendChild(fr)
    }

    // 判断是否为节点 
    isElementNode(el) {
        return el.nodeType === 1
    }

    // 将节点内容转到fragment 
    node2fragment(el) {
        const fr = document.createDocumentFragment();
        [...el.children].forEach(child => {
            // 子节点只能有一个父节点，1.从源节点删除 2.添加到新节点
            fr.appendChild(child)
        });
        // console.log(fr)
        return fr
    }

    // 编译节点 
    compile(fr, vm) {
        ;
        // childNodes返回所有子节点(包括换行) children返回所有子节点 p h1 ...
        [...fr.childNodes].forEach(child => {
            // 表达式/指令会同时存在一个节点上，各自编译即可
            // 表达式/指令 不同的compile方式

            // 编译指令
            if (this.isElementNode(child)) {
                this.compileElement(child, vm)
            } else {
                // 编译表达式
                this.compiletext(child, vm)
            }

            // 递归遍历嵌套元素
            if (child.childNodes) {
                /* 
                   注意：递归遍历需将VM传递进去，不然导致VM丢失
                */
                this.compile(child, vm)
            }
        })

    }

    // 编译表达式
    compiletext(el, vm) {
        var str = el.textContent

        if (/\{\{(.+?)\}\}/g.test(str)) {
            this.directiveUtil.text(el, str, vm)
        }
    }

    // 判断是否为指令
    isDirective(name) {
        // 普通指令 v-
        // startsWith区分大小写
        if (name.startsWith('v-')) {
            return 1
            // 事件指令 @XXX
        } else if (name.startsWith('@')) {
            return 2
        }
    }

    // 编译指令
    compileElement(el, vm) {
        // 获取节点属性 element.attributes namedNodeMap对象(字符串形式的名/值对，每一对名/值对对应一个属性节点)
        [...el.attributes].forEach(namedNode => {
            const {
                // 必须用name,value结构
                name,
                value
            } = namedNode
            // v-text=XXX/v-on:click=XXX 指令
            // console.log(name)
            if (this.isDirective(name) === 1) {
                // 指令再切分
                // .substring区分大小写
                const names = name.substring(2).split(':')
                const [directive, event] = names
                this.directiveUtil[directive](el, value, vm, event)
                el.removeAttribute(name)
            } else if
            // @指令
            (this.isDirective(name) === 2) {
                const event = name.substring(1)
                this.directiveUtil.on(el, value, vm, event)
                el.removeAttribute(name)
            }

        })
    }

    // 指令函数集合
    directiveUtil = {
        // 事件绑定
        on(el, expr, vm, event) {
            el.addEventListener(event, vm.methods[expr].bind(vm))
        },


        // 数据编译与更新   闭包的应用
        model(el, expr, vm) {
            new Watcher(vm, expr, this, (newVAL) => {
                this.updater.modelUpdater(el, newVAL)
            })
            const value = this.getMsg(expr, vm)
            this.updater.modelUpdater(el, value)
        },
        html(el, expr, vm) {
            new Watcher(vm, expr, this, (newVAL) => {
                this.updater.htmlUpdater(el, newVAL)
            })
            const value = this.getMsg(expr, vm)
            this.updater.htmlUpdater(el, value)
        },
        text(el, expr, vm) {
            var value
            // 表达式 例：---{{hobby.one}}---{{name}}
            if (expr.indexOf('{{') !== -1) {
                value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                    new Watcher(vm, args[1], this, () => {
                        // 表达式更新回调函数的新值无法通过watcher获取，自行获取再传给updater
                        this.updater.textUpdater(el,
                            this.getContentVal(expr, vm)
                        )
                    })
                    return this.getMsg(args[1], vm)
                })
            } else {
                // 指令
                new Watcher(vm, expr, this, (newVAL) => {
                    this.updater.textUpdater(el, newVAL)
                })
                value = this.getMsg(expr, vm)
            }

            this.updater.textUpdater(el, value)
        },

        // 取得属性对应的data值
        getMsg(expr, vm) {
            return expr.split('.').reduce((accu, cur) => accu[cur], vm.data)
        },
        // 用于表达式回调更新视图获取新值
        getContentVal(str, vm) {
            return str.replace(/\{\{(.+?)\}\}/g, (...args) =>
                this.getMsg(args[1], vm)
            )
        },

        //更新器
        updater: {
            modelUpdater(node, value) {
                node.value = value
            },
            htmlUpdater(node, value) {
                node.innerHTML = value
            },
            textUpdater(node, value) {
                node.textContent = value
            }
        }
    }
}