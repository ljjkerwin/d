/**

排序算法稳定性：如果Ai = Aj，排序前Ai在Aj之前，排序后Ai还在Aj之前，则称这种排序算法是稳定的。通俗地讲就是保证排序前后两个相等的数的相对顺序不变。

 */



/**
冒泡排序
重复地走访过排序的元素，依次比较相邻两个元素，如果他们的顺序错误就把他们调换过来，直到没有元素再需要交换，排序完成。这个算法的名字由来是因为越小(或越大)的元素会经由交换慢慢“浮”到数列的顶端。
时间复杂度：n^2：(n-1+1)*(n-1)/2 = n(n-1)/2
稳定
 */
export function bubbleSort(arr = []) {
  const len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}



/**
选择排序：初始时在序列中找到最小（大）元素，放到序列的起始位置作为已排序序列；然后，再从剩余未排序元素中继续寻找最小（大）元素，放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。
与冒泡的区别：冒泡时排序不正确即交换，选择排序则是每一个父循环交换一次
稳定性：不稳定，例如[5,5,2]的首轮排序，第一个5和2交换了位置
 */
export function selectionSort(arr = []) {
  const len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let min = i;
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[min]) {
        min = j;
      }
    }
    if (min !== i) {
      let temp = arr[i];
      arr[i] = arr[min];
      arr[min] = temp;
    }
  }
  return arr;
}



/**
插入排序：对于未排序数据(右手抓到的牌)，在已排序序列(左手已经排好序的手牌)中从后向前扫描，找到相应位置并插入。
插入排序不适合对于数据量比较大的排序应用
 */
export function insertionSort(arr = []) {
  const len = arr.length;
  for (let i = 1; i < len; i++) {
    let j = i - 1;
    let temp = arr[i];
    while (j >= 0 && temp < arr[j]) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = temp;
  }
  return arr;
}




/**
二分插入排序：对于插入排序，如果比较操作的代价比交换操作大的话，可以采用二分查找法来减少比较操作的次数
 */
export function insertionSortDychotomy(arr = []) {
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
    console.log(left, right,arr)
  }
  return arr;
}



/**
快速排序：通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据都比另外一部分的所有数据都要小，然后再按此方法对这两部分数据分别进行快速排序，整个排序过程可以递归进行，以此达到整个数据变成有序序列。
时间复杂度：nlogn
不稳定
 */
export function quickSort(arr = [], start = 0, end = arr.length - 1) {
  if (start >= end) return;
  let left = start, right = end;
  const mid = arr[left];
  while (left < right) {
    while (left < right && arr[right] >= mid) {
      right--;
    }
    arr[left] = arr[right];
    while (left < right && arr[left] <= mid) {
      left++;
    }
    arr[right] = arr[left];
  }
  arr[left] = mid;
  quickSort(arr, start, left - 1);
  quickSort(arr, left + 1, end);
  return arr;
}