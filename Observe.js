// Dep dependence依赖
class Dep {
    constructor() {
        // 保存watchers的数组 为什么是数组：多个指令或表达式指向同一个data
        // 多次调用同一个数据的get()方法：数据变化时通知多个watcher
        this.subs = []
    }

    // 将watcher添加到subs Dep.target=watcher做桥接
    addSub(w) {
        this.subs.push(w)
    }

    // 数据变化(触发set()函数)通知Watcher
    notify() {
        this.subs.forEach(w => {
            w.updater()
        })
    }
}

class Observer {
    constructor(data) {
        this.data = data
        this.observer(data)
    }

    // 拆解data对象
    observer(data) {
        if (data && typeof data === 'object') {
            Object.keys(data).forEach((item) => {
                this.defineReactive(data, item, data[item])
            })
        }
    }

    defineReactive(obj, key, value) {
        //递归遍历
        this.observer(value)

        // 劫持数据时创建dep
        const dep = new Dep()

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: false,
            // 读取数据直接进入get()函数
            get() {
                Dep.target && dep.addSub(Dep.target)

                return value
            },
            set: (newVal) => {
                value = newVal

                this.observer(newVal)
                // 不可直接将新值传递给watcher以更新，newVal可能是一个对象。因此新值通过函数读取(调用get方法读取)
                // dep.notify(newVal)
                dep.notify()
            }
        })
    }
}