// 最长递增子序列（这什么鬼算法啊啊啊啊啊啊） -- 应用场景在patchKeyedChildren中
// 两个序列中最长递增的非连续子序列 => 索引递增、非连续
// a b c d e f g h i j k
// a b c h e f g d i j k
// 结果：a b c _ e f g _ i j k -> a b c e f g i j k
// 需要用到贪心算法 + 二分查找

// 2 3 7 6 8 4 9 11 -> 求最长子序列个数

// 2
// 2 3
// 2 3 7 暂定
// 2 3 6 贪心算法：这个比7小更有潜力
// 2 3 6 8
// 2 3 4 8 贪心算法：这个比6小更有潜力(只需要个数不在乎顺序，但是8要记住之前是6)
// 2 3 4 8 9 11 结果是6个

// 得出的结果不对怎么办？ - 追溯
// 记录每一个的前一个，第一个的前一个是null

// 2 3 1 5 6 8 7 9 4
// 2    (2前一个是null)
// 2 3  (3的前一个是2)
// 1 3  (1的前一个是null)
// 1 3 5  (5的前一个是3)
// 1 3 5 6  (6的前一个是5)
// 1 3 5 6 8  (8的前一个是6)
// 1 3 5 6 7  (7的前一个是6)
// 1 3 5 6 7 9  (9的前一个是7)
// 1 3 4 6 7 9  (4的前一个是3)

// 追溯 9 7 6 5 3 2 -> 结果 2 3 5 6 7 9

// 算法实现
export function getSequence(arr: number[]) {
    const result = [0];
    const p = result.slice(0); // 用于存放索引，记住前驱节点
    // 二分查找部分 - 递增序列用二分查找快
    let start; //开始索引
    let end; //结束索引
    let middle; //中间索引
    const len = arr.length;  // 数组长度
    for (let i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {  // 实际应用中 0 不参与比较
            // 拿出数组的最后一项，和当前的这一项作比对
            const resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) {  // 当前项大于最后一项
                p[i] = result[result.length - 1]; // 放入最后一个索引
                result.push(i);  // 直接添加当前项的索引
                continue
            }
            //  else {  // 当前项小于最后一项
            //     // 找到比当前项小的最后一项的索引
            //     let left = 0;
            //     let right = result.length - 1;
            //     while (left < right) {
            //         const middle = (left + right + 1) >> 1;
            //     }
            // }
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {
            middle = (start + end) / 2 | 0; // | 0  是取整去小数点
            if (arr[result[middle]] < arrI) {
                start = middle + 1;
            } else {
                end = middle;
            }
        }
        if (arr[result[start]] > arrI) {
            // 如果存的小于arrI，替换为arrI的索引
            p[i] = result[start - 1]; // 放入前一个的索引
            result[start] = i;
        }
        // 追溯
        let l = result.length;
        let last = result[l - 1]; // 取出最后一项

        while (l-- > 0) {
            result[l] = last;
            last = p[last]; // 在数组中找到最后一个
        }
    }
    // 需要创建前驱节点，通过最后一项进行追溯（最后一项是不会错的）
    return result
}

// 求数组对应的索引 - 子序列：1 3 4 6 8 9 -> 对应索引：2 1 8 4 6 7
// console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))