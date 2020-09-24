class MVVM {
    constructor(option) {
        this.el = option.el
        this.data = option.data
        this.methods = option.methods
        // 如何为methods的方法绑定this    绑定为vm，修改vm中的数据(并不修改option中的数据)
        //  option.methods.handClick.bind(this) 这里绑定没用，触发时this为触发对象
        
        if (this.el) {
            //实现数据监听Observe 
            // 数据监听在前：
            new Observer(this.data)

            // 实现编译器compile
            new Compile(this.el, this, this.data)
        }
    }
}