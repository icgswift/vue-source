//对比前后数据变化触发更新
class Watcher {
    constructor(vm, expr, util, cb) {
        console.log('初始化')

        this.vm = vm
        this.expr = expr
        this.util = util
        // cb：更新数据的回调函数
        this.cb = cb

        this.oldVal = this.getOldVal(util, expr, vm)
    }

    // 获取旧数据,此数据和 编译指令和表达式 获取的数据一致(编译指令和表达式得到数据时 new watcher已执行)
    getOldVal(util, expr, vm) {

        Dep.target = this
        // 读取数据便会调用get()方法  添加watcher到subs
        const oldVal = util.getMsg(expr, vm)
        // 避免重复添加watcher:编译指令和表达式得到数据同样会调用get()
        Dep.target = null

        return oldVal
    }

    // data变化 watcher通知updater更新view
    // 注：不能形成闭包
    updater() {
        // 获取新值
        const newVal = this.util.getMsg(this.expr, this.vm)
        if (newVal !== this.oldVal) {
            this.cb(newVal)
        }
    }
}