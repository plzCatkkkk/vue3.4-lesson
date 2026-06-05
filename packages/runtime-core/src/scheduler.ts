// 调度器
// 作用：控制任务执行时机，当所有数据改变后，再执行渲染

// 缓存当前要执行的队列
const queue: Function[] = [];
let isFlushing = false;

const resolvePromise = Promise.resolve();

// 如果同时在一个组件中更新多个状态 job肯定是同一个 
export function queueJob(job: Function) {
    // 添加任务
    if (!queue.includes(job)) {
        queue.push(job);
    }
    // 如果当前没有在运行的方法，则执行队列中的任务
    if (!isFlushing) {
        console.log('queueJob', job);
        isFlushing = true;
        // 开启一个异步任务-微任务-会在宏任务完成后再执行
        resolvePromise.then(() => {
            isFlushing = false;
            // 拷贝队列
            // 防止在执行过程中有新的任务加入
            const copy = queue.slice(0);
            queue.length = 0;
            // 让每个job执行
            copy.forEach((job) => job())
            copy.length = 0;
        });
    }
}