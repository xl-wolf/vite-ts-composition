// 定义类
interface EventFace {
  on: (TypeName: string, callback: Function) => void; //订阅消息
  emit: (TypeNam: string, ...args: Array<any>) => void; // 发布消息
  off: (TypeName: string, callback: Function) => void; //删除指定函数
  once(TypeName: string, callback: Function): void; // 只执行一次，删除指定函数
}
// 定义对象 { name:[fun1，fun2],name2:[fun3,fun4]}
interface List { [index: string]: Array<Function> }

class Eventhub implements EventFace {
  list: List;
  constructor() {
    this.list = {};
  }
  //订阅消息
  on(TypeName: string, callback: Function): void {
    this.list[TypeName];
    const callbackList: Array<Function> = this.list[TypeName] || [];
    callbackList.push(callback);
    this.list[TypeName] = callbackList;
  }
  // 发布消息
  emit(TypeNam: string, ...args: Array<any>): void {
    if (TypeNam && args) {
      this.list[TypeNam]?.forEach(fun => {
        // 执行全部
        fun.apply(this, args)
      })
    } else {
      console.log("参数错误")
    }
  }
  //解除绑定
  off(TypeName: string, callback: Function): void {
    if (TypeName && callback) {
      const index: number = this.list[TypeName]?.indexOf(callback)
      console.log(index)
      if (index > -1) {
        this.list[TypeName]?.splice(index, 1)// 返回删除的元素
      } else {
        console.log("没找到这个函数")
      }
    } else {
      console.log("参数错误")
    }
  }
  // 只执行一次
  once(TypeName: string, callback: Function): void {
    if (TypeName && callback) {
      // 和on一样，只是它添加的只能使用一次
      const decor = (...args: Array<any>) => {
        callback.apply(this, args)// 执行然后删除
        this.off(TypeName, decor)// 删除方法
      }
      // 使用on添加到，list中
      this.on(TypeName, decor);
    } else {
      console.log("参数错误")
    }
  }
}

export default new Eventhub()
export const eventhub = new Eventhub()



