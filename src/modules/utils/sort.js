function swap(arr, l, r) {
  let temp = arr[l];
  arr[l] = arr[r];
  arr[r] = temp;
  return arr;
}



/**
冒泡排序

从左到右走访相邻元素，把较大的往后移动，第一轮筛选出第一大，第二轮筛选出第二大。。。直到最后一轮两个值比较选出倒数第二大

外循环从n个成员到2个成员，一共跑n-1次
内循环从对比n-1次到1次，变量表示为n-1-i

时间复杂度：平均O(n^2) 最佳O(n) 最坏O(n^2)
空间复杂度：O(1)
稳定性：稳定
 */
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;

    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        didSwap = true;
      }
    }

    if (didSwap === false) break;
  }

  return arr;
}



/**
选择排序

每一轮循环寻找最小值，记录下标，循环的结尾与排头元素交换；之后对剩下元素做新一轮操作

与冒泡的区别：冒泡时排序不正确即交换，选择排序则是每一个父循环交换一次
外循环n-1次
内循环n-1次到1次

时间复杂度：平均O(n^2) 最佳O(n^2) 最坏O(n^2)
空间复杂度：O(1)
稳定性：不稳定
 */
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[min]) {
        min = j;
      }
    }
    swap(arr, i, min);
  }

  return arr;
}



/**
插入排序

数组分成左右两部分，左边有序，右边无序；将右边第一个元素跟左边部分从右到左比较，插入到合适的有序位置；再次操作右边部分第一个元素

外循环n-1次
内循环从1到n-1

时间复杂度：平均O(n^2) 最佳O(n) 最坏O(n^2)
空间复杂度：O(1)
稳定性：稳定
 */
function insertionSort(arr) {
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    let cur = arr[i]; // 缓存当前对比元素，空出一个位置让前面的元素可以往后推移动

    let j = i - 1;
    while (j >= 0 && arr[j] > cur) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = cur;
  }

  return arr;
}



/**
希尔排序

希尔排序是插入排序的一种又称“缩小增量排序”，是冲破O(n^2）的第一批算法之一
它与插入排序的不同之处在于，它会优先比较距离较远的元素

按照一定增量对数组进行分组，并对分组各自进行插入排序；之后减少增量，继续分组排序，直到增量减到1
常见增量序列n/2,n/4,n/8...1，又称希尔增量

时间复杂度：最佳O(nlog2n) 最坏O(n^2) 希尔排序的时间复杂度与增量序列的选取有关
空间复杂度：O(1)
稳定性：不稳定
 */
function shellSort(arr) {
  const n = arr.length;
  let gap = Math.floor(n / 2);

  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      let cur = arr[i];
      let j = i - gap;
      while (j >= 0 && arr[j] > cur) {
        arr[j + gap] = arr[j];
        j -= gap;
      }
      arr[j + gap] = cur;
    }

    gap = Math.floor(gap / 2);
  }

  return arr;
}



/**
二分插入排序

对于插入排序，如果比较操作的代价比交换操作大的话，可以采用二分查找法来减少比较操作的次数

时间复杂度：O(nlog2n)
空间复杂度：O(1)
稳定性：稳定
 */
function insertionSortDychotomy(arr = []) {
  const len = arr.length;
  for (let i = 1; i < len; i++) {
    let left = 0;
    let right = i - 1;
    let mid;
    let temp = arr[i];
    while (left <= right) {
      mid = parseInt((left + right) / 2);
      if (temp < arr[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    for (let j = i - 1; j >= left; j--) {
      arr[j + 1] = arr[j];
    }
    arr[left] = temp;
  }
  return arr;
}



/**
归并排序

归并操作(merge)，也叫归并算法，指的是将两个顺序序列合并成一个顺序序列的方法。
归并排序，采用分治法，递归拆分子序列；使每个子序列有序，合并有序的子序列后再次排序，结果返回到上一层

因为需要额外空间，所以大数据量排序不建议使用
因为使用递归调用，长度为n的数组最终会调用mergeSort()函数 2n-1次，这意味着一个长度超过1500的数组会在Firefox上发生栈溢出错误。可以考虑使用迭代来实现同样的功能。

改进：归并时先判断前段序列的最大值与后段序列最小值的关系再确定是否进行比较，最佳时间复杂度可达O(n)


时间复杂度：平均O(nlog2n) 最佳O(n) 最坏O(nlog2n)
空间复杂度：O(n)
稳定性：稳定
 */
function　mergeSort_merge(left, right) {
  var　result =[];

  while(left.length > 0 && right.length > 0){
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }
  return　result.concat(left).concat(right);
}

function mergeSort0(items) {
  if (items.length == 1) {
    return　items;
  }

  var　middle = Math.floor(items.length/2),
  left = items.slice(0, middle),
  right = items.slice(middle);
  return　mergeSort_merge(mergeSort(left), mergeSort(right));
}


/**
归并迭代版
避免了递归时深度为log2n的栈空间
 */
function mergeSort(arr) {
  const n = arr.length;
  let newArr = [];

  for (let size = 2; size < n * 2; size *= 2) {
    for (let left = 0; left < n; left += size) {
      let right = left + size - 1;
      if (right >= n) right = n - 1;
      let mid = left + size / 2;

      let i = left,
        j = mid,
        cur = left;

      while (i < mid && j <= right) {
        if (arr[i] <= arr[j]) {
          newArr[cur++] = arr[i++];
        } else {
          newArr[cur++] = arr[j++];
        }
      }
      while (i < mid) {
        newArr[cur++] = arr[i++];
      }
      while (j <= right) {
        newArr[cur++] = arr[j++];
      }
    }
    arr = newArr; // 下一个循环操作对象是上一个的结果
    newArr = []; // 临时空间清空
  }

  return arr;
}




/**
快速排序

通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据都比另外一部分的所有数据都要小，然后再按此方法对这两部分数据分别进行快速排序，整个排序过程可以递归进行，以此达到整个数据变成有序序列。

优化：取左中右三值得中间值做参考值，减少最坏情况出现

时间复杂度：平均O(nlog2n) 最佳O(nlog2n) 最坏O(n^2)
空间复杂度：O(log2n)
稳定性：不稳定
 */
function quickSort(arr = [], start = 0, end = arr.length - 1) {
  if (start >= end) return arr;

  const mid = arr[start]; // 中间值缓存着用于多次比较
  let left = start, right = end;
  
  while (left < right) {
    while (left < right && arr[right] >= mid) {
      right--;
    }
    arr[left] = arr[right]; // 从右边数起的第一个偏小值放到左边中间值位置
    while (left < right && arr[left] <= mid) {
      left++;
    }
    arr[right] = arr[left]; // 从左边数起的第一个偏大值放到右边刚才空出的位置
  }

  arr[left] = mid; // 直到left和right相遇，左边值有空位，中间值补位

  quickSort(arr, start, left - 1);
  quickSort(arr, left + 1, end);

  return arr;
}



/**
堆排序

堆实质上是完全二叉树，必须满足：树中任一非叶子结点的关键字均不大于（或不小于）其左右孩子（若存在）结点的关键字。

大顶堆：根结点为最大值，每个结点的值大于或等于其孩子结点的值。
小顶堆：根结点为最小值，每个结点的值小于或等于其孩子结点的值。

将大顶堆根节点跟最后一个节点交换，将剩下节点通过shiftDown修复为大顶堆；如此重复，直至剩余的元素个数为1

时间复杂度：O(nlog2n)
空间复杂度：O(1)
稳定性：不稳定
 */
function heapSort(arr) {
  function shiftDown(arr, top, len) {
    let cur = arr[top];
    let i = top * 2 + 1;
    while (i < len) {
      if (i + 1 < len && arr[i] < arr[i + 1]) {
        i++;
      }
      if (cur < arr[i]) {
        arr[top] = arr[i];
        top = i;
        i = i * 2 + 1;
      } else {
        break;
      }
    }
    arr[(i - 1) / 2] = cur;
  }

  const n = arr.length;

  for (let i = ~~(n / 2) - 1; i >= 0; i--) {
    shiftDown(arr, i, n);
  }

  for (let i = n - 1; i > 0; i--) {
    swap(arr, 0, i);
    shiftDown(arr, 0, i);
  }

  return arr;
}




/**
桶排序

桶排序是计数排序的升级版。它利用了函数的映射关系，高效与否的关键就在于这个映射函数的确定。

桶排序 (Bucket sort)的工作的原理：假设输入数据服从均匀分布，将数据分到有限数量的桶里，每个桶再分别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行排

时间复杂度：最佳O(n+k) 最坏O(n^2)
空间复杂度：O(n+k)
稳定性：稳定
 */
function bulletSort(arr) {
  if (arr.length <= 1) return arr;
  let min = arr[0],
    max = min,
    len = arr.length;

  for (let i = 0; i < len; i++) {
    if (arr[i] > max) {
      max = arr[i];
    } else if (arr[i] < min) {
      min = arr[i];
    }
  }

  let range = 2;
  let count = Math.floor((max - min) / range) + 1;

  const bullets = [];
  for (let i = 0; i < count; i++) {
    bullets[i] = [];
  }

  for (let i = 0; i < len; i++) {
    bullets[Math.floor((arr[i] - min) / range)].push(arr[i]);
  }

  for (let i = 0; i < count; i++) {
    insertionSort(bullets[i]);

    if (i) {
      let len = bullets[i].length;
      for (let j = 0; j < len; j++) {
        arr.push(bullets[i][j]);
      }
    } else {
      arr = bullets[0];
    }
  }

  return arr;
}





class Num {
  constructor(v) {
    this.v = v;
  }
  valueOf() {
    // console.log('valueOf')
    return parseInt(this.v);
  }
  toString() {
    // console.log('toString')
    return String(this.v);
  }
}

const arr = [6,2,1,new Num(8.1),new Num(8.2),new Num(8.3),new Num(8.4),new Num(8.5),4,2,7,21]

console.log(arr.join(','),'---')
console.log(bulletSort(arr).join(','))