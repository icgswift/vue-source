class Observer {
    constructor(data, vm) {
        this.defineReactive(data, vm)
    }

    // 拆解data对象
    defineReactive(data, vm) {
        Object.keys(data).forEach((item) => {
            // console.log(item, typeof item, data[item], typeof data[item])

            Object.defineProperty(vm, item, {
                enumerable: true,
                configurable: false,
                get() {
                    /* 
                        Maximum call stack size exceeded
                        将item绑定到data,通过data.name读取时调用get()函数 返回data.name
                        继续调用get()函数 形成死循环
                    */
                    return data[item]
                },
                set: (value) => {
                    if (typeof value === 'object') {
                        this.defineReactive(value, vm)
                    }
                    data[item] = value
                }
            })

            if (typeof data[item] === 'object') {
                this.defineReactive(data[item], vm)
            }
        })
    }

}