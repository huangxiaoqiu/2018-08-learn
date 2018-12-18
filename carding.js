/**
 * 知识梳理
 * 
 * 1、promise
 * 没有promise之前的异步操作都是用callback的模式，有了promise之后就是 .then 模式了
 * callback编程的问题：1、没法捕获错误，异步代码不能try{}catch(e){}
 *                    2、异步编程中，可能会出现回调地狱问题
 *                    3、多个异步的操作，在同一时间调用，无法同步异步的结果
 * 同步异步的结果，可以用发布订阅来解决（核心思想是： 订阅的时候，把订阅的内容，塞到数组里面，发布的时候，循环数组执行）
 * 
 * promise的特点： 
 * 1、三个状态：pending、resolved、rejected
 * 2、三个实例方法：then、catch、finally
 * 3、五个静态方法：All(可以让多个异步请求并发执行)、race、rejected、resolved、deferred
 * 
 * promise化的插件有： bluebird(第三方模块)
 * 
 * async + await  (加上这两个语法糖，使得异步代码跟同步代码一样，特别适合优化回调地狱的代码，便于维护
 * 前提是异步操作被promise化，才可以用达到解决回调地狱的问题，promise化可以用 bluebird里面的prmisify方法属性，也可以用node的核心模块util)
 * 
 */


 /**
  * es6
  * 1、let/const 变量声明
  * 2、展开运算符 ...
  * 3、深拷贝：function deepClone(obj){
  if (obj == null) return obj; // null == undefined
  if(obj instanceof Date) return new Date(obj);
  if(obj instanceof RegExp) return new RegExp(obj);
  if (typeof obj !='object') return obj;
  let newObj = new obj.constructor;
  for (let key in obj){
    newObj[key] = deepClone(obj[key]);
  }
  return newObj
}
  * 
  * 4、解构赋值
  * 5、箭头函数（没有argument对象，this指向：看上级作用域中的this指向），改变this指向的方法（call，apply，bind）
  * 6、Object.defineProperty(targetObj, propertyname, options);
  * 7、mvvm 的实现
  * function update(){
        console.log('数据改变了 刷新视图')
    }

    let obj = {
        name:'zfpx',
        age:{age:9}
    }

    function observer(o) { // 把当前对象上的所有属性 都改写成 Object.defineProperty的形式
        if(typeof o !== 'object'){return o;}
        for(let key in o){
            defineReactive(o,key,o[key]);
        }
    }
    function defineReactive(obj,key,value) {
        observer(value); // 只要是对象 就要不停的去监控
        Object.defineProperty(obj,key,{
            get(){return value;},
            set(val){
            observer(val)
            if(val !== value){ // 保证设置的属性 和以前的值不一样才更新
                update();
                value = val;
            }
            }
        })
    }
    observer(obj);
    obj.age = {name:'zfpx'};
  * 
  * 8、proxy代理，来实现双向数据绑定
  * let obj = ['zfpx']
    let proxy = new Proxy(obj,{ // 代理的属性 13种 
        set(target,key,value){
            if(key === 'length') return true;
            console.log('数据更新了')
            return Reflect.set(target, key, value);
        },
        get(target,key){ // 可以使用reflect
            return Reflect.get(target, key)
        }
    });
    proxy.push('1'); // 深度监控 (可以递归 也可以具体拿到某个对象实现)
  * 
  * 9、类和继承(es5中用函数来模拟类的实现，任何函数都有一个prototype属性（原型对象），是一个指针引用，而prototype自带的属性有 constructor 和 __proto__，任何一个对象都有__proto__这个属性，指向当前对象所在类的原型，原型链就是通过这个属性链起来的)
  * 1）继承实例上的属性
  * 在子类中执行： Parent.call(this)
  * 2）继承共有属性(通过延长原型链的方式)
  * Child.prototype.__proto__ = Parent.prototype
  * 3）全都要
  * call + 延长原型链（原型继承）
  * 
  * 10、es6的类的实现（class）
  * 1）只支持静态方法，不支持静态属性
  * 2）constructor 函数里面放的一般是实例属性
  * 3）函数体里面放的是原型属性/方法，如果方法名前面加了static 则是静态方法
  * 4）继承通过 extends 关键字来实现 class Child extends Parent{}，如果父类需要传参，则子类必须在constructor函数体里面执行 super() 方法，并且把参数传递进去 全部继承（包括实例上的、原型上的、静态方法）
  * 5）装饰器：用来装饰类中的属性和类中的方法和类的，用到的比较少 （@装饰器名称），是一个函数
  * 
@flag
class Circle{
  @readOnly PI = 3.14;
  @readOnly a = 1;
  @log('--xxx--')
  say(){
    console.log('你好')
  }
}
function readOnly(CProt,key,descriptor) { // 这里面有三个参数
  descriptor.writable = false;
}
function log(log) {
  return function (CProt, key, descriptor){
    let old = descriptor.value;
    descriptor.value = function () {
      console.log(log);
      old();
    }
  }
}
function flag(target) {
  target.a = 1;
}
let c = new Circle;
c.say()
console.log(Circle.a);
  * 
  * 
  * 11、set/map (感觉是数据结构类)
  * set： 就是没有重复项的数组，可以轻松实现数组的去重工作 let newarr = [...new Set(arr)];
  *       两个数组的并集：let binArr = [...new Set([...arr1, ...arr2])];
  *       两个数组的交集：let arr1 = [1, 2, 3];
                        let arr2 = [3, 4, 5];
                        let s1 = new Set(arr1);
                        let s2 = new Set(arr2);
                        let arr = [...s1].filter((item)=>{
                            return s2.has(item);
                        });                   
  * 
  *       两个数组的差集：let arr1 = [1, 2, 3];
                        let arr2 = [3, 4, 5];
                        let s1 = new Set(arr1);
                        let s2 = new Set(arr2);
                        let arr = [...s1].filter((item)=>{
                            return !s2.has(item);
                        });
  * 
  * 
  * 数组中常用的方法： forEach(用来循环的)、map(用来映射的)、reduce(用来收敛出一个结果的)、some、every、filter（用来过滤的）
  * 
  */


/**
 * eventLoop
 * 
 * 事件环  分为：浏览器的事件环 和 node的事件环
 * 微任务：then
 * 宏任务：setTimeout  setImmediate
 * 
 * 浏览器的机制是：先执行栈中的，微任务和宏任务的回调会分开存放，栈中执行完毕会执行所有的微任务，然后取出队列中的第一个宏任务，执行完后会再清空微任务，依次循环执行
 * 
 */



/**
* module
* 
* require 的实现
*/



/**
 * npm
 */



/**
 * eventEmitter
 */



 
/**
 * buffer
 */



/**
 * fs
 */



/**
 * stream
 */




/**
 * http
 */




/**
 * cli
 */


/**
 * cookie
 * 
 * 
 * session
 */



/**
 * koa
 */