// import Observer from './Observe'    暂不支持ES6语法

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

            /* child.children(不包含文本 xxx/换行) 一直为真，只是有没有长度的问题
               if (child.children) {
                       this.compile(child) 
                    }
             */
        })

    }

    // 指令函数集合
    directiveUtil = {
        // 取得属性对应的data值
        getMsg(value, vm) {
            return value.split('.').reduce((accu, cur) => accu[cur], vm.data)
        },
        text(el, value, vm) {
            el.textContent = this.getMsg(value, vm)
            // const values = value.split('.')
            // if (values.length > 1) {
            //     el.textContent = data[values[0]][values[1]]
            // } else {
            //     el.textContent = data[value]
            // }
        },
        html(el, value, vm) {
            el.textContent = this.getMsg(value, vm)
        },
        model(el, value, vm) {
            el.placeholder = this.getMsg(value, vm)
        },
        on(el, value, vm, event) {
            el.addEventListener(event, vm.methods[value].bind(vm))
        }

    }

    // 编译表达式
    compiletext(node, vm) {
        // console.log(node) //文本节点
        // console.log(typeof node.textContent) string
        var str = node.textContent
        if (/\{\{(.+?)\}\}/g.test(str)) {
            /* 
               replace函数不会修改原字符串
               str=str.replace()为什么不可行
               变量的赋值关系 str = node.textContent 修改str的值并不会传递给node.textContent
            */
            node.textContent = str.replace(/\{\{(.+?)\}\}/g, (...args) =>
                // args默认四个参数
                this.directiveUtil.getMsg(args[1], vm)
            )
        }
    }

    // 编译指令
    compileElement(el, vm) {
        // 获取节点属性 element.attributes namedNodeMap对象(字符串形式的名/值对，每一对名/值对对应一个属性节点)
        [...el.attributes].forEach(namedNode => {
            const {
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
}

class Test {
    constructor(option) {
        this.el = option.el
        this.data = option.data
        this.methods = option.methods
        // 如何为methods的方法绑定this    绑定为vm，修改vm中的数据(并不修改option中的数据)
        //  option.methods.handClick.bind(this) 这里绑定没用，触发时this为触发对象
        if (this.el) {
            // 实现编译器compile
            new Compile(this.el, this, this.data)

            //实现数据监听Observe 
            new Observer(this.data,this)
        }
    }
}