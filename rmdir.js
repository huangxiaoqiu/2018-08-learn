/**
 * 先序 广度 同步/异步/promise/async+await
 */
let fs = require('fs');
let path = require('path');
let {promisify} = require('util');
let stat = promisify(fs.stat);
let readir = promisify(fs.readdir);
let rmdir = promisify(fs.rmdir);
let unlink = promisify(fs.unlink);

let mkdir = require('./mkdir');
// mkdir('a/b/c/d.js');
// mkdir('a/aa/bb.js');
/**
 * 步骤： 先把想要删除的目录及所有子目录的路径都横向读出来，放到一个数组里面，然后倒着删除数组中的所有目录所在的文件/文件夹
 * 1、先引入fs 和 path 核心模块
 * 2、写一个删除方法，把想要删除的路径传进去、把这个路径放到数组里面
 * 3、循环判断路径的文件类型，如果是文件夹则读取子文件，放到数组里面
 * 4、循环完后，倒着删除数组中的所有路径文件
 */

// 同步删除
function removeDirSync(p) {
    let arr = [p];
    index = 0;
    let current;
    while(current = arr[index++]) {
        let statObj = fs.statSync(current);
        if (statObj.isDirectory()) {
            let dirs = fs.readdirSync(current).map(dir => path.join(current, dir));
            arr = [...arr, ...dirs];
        } else {
            arr.splice(index, 1);index--;
            fs.unlinkSync(current);
        }
    }

    // 开始删除
    let len = arr.length - 1;
    while(cur = arr[len--]){
        fs.rmdirSync(cur);
    }
}

// removeDirSync('a');

// 异步删除
function removeDirAsync(p, cb) {
    let arr = [p];
    let index = 0;
    function next(current) {
        if (typeof current === 'undefined') {
            // 删除
            let len = arr.length - 1;
            function remove(curP) {
                fs.rmdir(curP, function() {
                    len--;
                    if (len < 0) {
                        cb();
                        return;
                    }
                    remove(arr[len]);
                })
            }
            remove(arr[len]);
        } else {
            fs.stat(current, function(err, statObj) {
                if (statObj.isDirectory()) {
                    fs.readdir(current, function(err, dirs) {
                        dirs = dirs.map(dir => path.join(current, dir));
                        arr = [...arr, ...dirs];
                        index++;
                        next(arr[index]);
                    })
                } else {
                    arr.splice(index, 1);index--;
                    fs.unlink(current, function(err){
                        next(arr[index]);
                    })
                }
            })
        }

    }
    next(arr[index]);
}
// removeDirAsync('a', function() {
//     console.log('删除成功！');
// })

// promise
function removeDirPromise(p) {
    return new Promise((resolve, reject) => {
        let arr = [p];
        let index = 0;
        function next(current) {
            if (typeof current === 'undefined') {
                // 删除
                arr = arr.map(cur => {
                    return new Promise((resolve, reject) => {
                        fs.rmdir(cur, function() {
                            resolve(cur);
                        })
                    })
                });

                Promise.all(arr).then((data) => {
                    resolve();
                })
            } else {
                fs.stat(current, function(err, statObj) {
                    if (statObj.isDirectory()) {
                        fs.readdir(current, function(err, dirs) {
                            dirs = dirs.map(dir => path.join(current, dir));
                            arr = [...arr, ...dirs];
                            index++;
                            next(arr[index]);
                        })
                    } else {
                        arr.splice(index, 1);index--;
                        fs.unlink(current, function(err){
                            next(arr[index]);
                        })
                    }
                })
            }

        }
        next(arr[index]);
    })
}
// removeDirPromise('a').then(() => {
//     console.log('删除成功！！！');
// });


// async + await
async function removeDirAwait(p){
    let arr = [p];
    let index = 0;
    let current;
    while(current = arr[index++]) {
        let statObj = await stat(current);
        if (statObj.isDirectory()) {
            let dirs = await readir(current);
            dirs = dirs.map(dir => path.join(current, dir));
            arr = [...arr, ...dirs];
        } else {
            arr.splice(index,1);index--;
            await unlink(current);
        }
    }
    let len = arr.length -1;
    let cur;
    while(cur = arr[len--]){
        await rmdir(cur);
    }
}
removeDirAwait('a');