/**
 * promise的特性
 * 1、promise 实例有三个状态，分别为 pending , fulfilled, rejected ,初始化的时候是pending，pending可以转化为另外两个状态中的任何一个，而且一旦转化了就不能再改变
 * 2、promise实例最典型的是必须有一个then方法，
 *    1）传递两个参数（如果两个参数不是函数，或者没传，则会被忽略，直接穿透到下一个then里面），两个参数是函数，如果实例是成功态，则会执行
 *    第一个函数参数，如果实例是失败态，则会执行第二个函数参数，
 *    2）而且then方法支持链式调用，所以then方法返回一个新的promise实例
 *    3）then方法是异步方法
 * 3、promise实例上的其他方法： catch, finally
 * 4、Promise构造函数上的静态方法： resolve、reject、all、race、defer
 *
 * promise的实现
 * 1、实现promise里面没有异步操作的最简单的promise，含有then方法的
 * 2、能处理异步操作的promise
 * 3、能链式调用的promise
 * 4、具有穿透特性，就是可以then（）什么参数都不传
 * 5、实例上的其他方法
 * 6、类上的方法（resolve,reject,all,race,defer）
 */
class Promise {
    constructor(executor) {
        let self = this;
        self.status = 'pending';
        self.value = undefined;
        self.reason = undefined;
        self.onFulfilledCallbacks = [];
        self.onRejectedCallbacks = [];

        function resolve(value) {
            if (self.status === 'pending') {
                self.status = 'fulfilled';
                self.value = value;
                self.onFulfilledCallbacks.forEach((fn) => {
                    fn();
                })
            }
        }

        function reject(reason) {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.reason = reason;
                self.onRejectedCallbacks.forEach((fn) => {
                    fn();
                })
            }
        }

        try {
            executor(resolve, reject);
        } catch (e) {

        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (data) {
            return data;
        };
        onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
            throw err;
        };
        let self = this;

        let promise2 = new Promise((resolve, reject) => {
            if (self.status === 'fulfilled') {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            if (self.status === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            if (self.status === 'pending') {
                self.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(self.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });

                self.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(self.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                })
            }
        });
        return promise2;
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    };

    finally(fn) {
        return this.then((data) => {
            fn();
            return data;
        },(err) => {
            fn();
            throw err;
        })
    };

    static resolve(data) {
        return new Promise((resolve, reject) => {
            resolve(data);
        })
    };

    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    };

    static all(promises) {
        let arr = [];
        let i = 0;
        return new Promise((resolve, reject) => {
            function processData(index, data) {
                arr[index] = data;
                if (++i === promises.length) {
                    resolve(arr);
                }
            }
            promises.forEach((promise, index) => {
                if (typeof promise.then === 'function') {
                    promise.then((value) => {
                        processData(index, value);
                    }, (err) => {
                        reject(err);
                    })
                } else {
                    processData(index, promise);
                }
            })
        })
    };

    static race(promises) {
        return new Promise((resolve, reject) => {
            promises.forEach((promise) => {
                if (typeof promise.then === 'function') {
                    promise.then(resolve, reject);
                } else {
                    resolve(promise);
                }
            })
        })
    };

    static deferred () {
        let dfd = {};
        dfd.promise = new Promise((resolve, reject) => {
            dfd.resolve = resolve;
            dfd.reject = reject;
        });
        return dfd;
    };
}
function resolvePromise(promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new TypeError('循环引用！'));
    }
    let called = false;
    if ((x != null && typeof x === 'object') || typeof x === 'function') {
        try{
            let then = x.then;
            if (typeof then === 'function') { //x是promise实例
                then.call(x, (value) => {
                    if(called) return;
                    called = true;
                    resolvePromise(promise2, value, resolve, reject)
                }, (reason) => {
                    if (called) return;
                    called = true;
                    reject(reason);
                })
            } else {
                resolve(x);
            }
        }catch(e) {
            if(called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}
module.exports = Promise;