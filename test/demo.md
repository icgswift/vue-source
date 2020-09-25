# mvc(VM)
model 数据
view  视图/DOM
controller(viewmodel) 逻辑/实现

# 数据绑定
何为数据绑定: 数据的流动
单向绑定：model --> view             
         实现/
             展示:fragment
             修改：Object.defineProperty
双向绑定：model <--> view   场景：可输入元素input textarea