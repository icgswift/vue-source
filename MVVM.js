class MVVM {
    /* 
      注：全程没有对new MVVM(option)传入的option进行任何操作
         将option传入的数据绑定到VM
         操作VM的数据：无论是data，还是methods
    */
    constructor(option) {
        this.el = option.el
        this.data = option.data
        this.methods = option.methods

        if (this.el) {
            //实现数据监听Observe 
            // 数据监听在前：
            new Observer(this.data)

            // 实现编译器compile
            new Compile(this.el, this, this.data)

            // 数据代理
            this.proxy(this.data)
        }
    }
    proxy(data) {
        for (const item in data) {
            Object.defineProperty(this, item, {
                get() {
                    return data[item]
                },
                set(newVal) {
                    data[item] = newVal
                }
            })
        }

    }
}