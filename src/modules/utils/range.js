export default class Range {
  constructor() {
    this.precision = 1;
  	this.data = [];
  }
  
  add(start, end = start) {
    if (!(end >= start)) return this;
     
    const data = this.data;

    for (let i = 0, rangeItem; i <= data.length; i++) {
      rangeItem = data[i];
      // empty
      if (!rangeItem) {
        data.push([start, end]);
        break;
      // in front of
      } else if (rangeItem[0] - end > this.precision) {
        data.splice(i, 0, [start, end]);
        break;
      // intersectant
      } else if (start - rangeItem[1] <= this.precision) {
        rangeItem[0] = Math.min(start, rangeItem[0]);
        rangeItem[1] = Math.max(end, rangeItem[1]);
        // more then one
        if (data[i + 1] && data[i + 1][0] - rangeItem[1] <= this.precision) {
          data.splice(i, 1);
          this.add(rangeItem[0], rangeItem[1]);
        }
        break;
      }
    }

    return this;
  }

  get(start = -Infinity, end = Infinity) {
    const data = this.data,
      result = [];

    if (!(end >= start)) return result;
   
    let rangeItem;
    for (let i = 0; i < data.length; i++) {
      rangeItem = data[i];
      // intersectant
      if (start <= rangeItem[1] && end >= rangeItem[0]) {
        result.push([Math.max(start, rangeItem[0]), Math.min(end, rangeItem[1])]);
      }
    }

    return result;
  }

  getEmpty(start = -Infinity, end = Infinity) {
    const data = this.data,
      result = [];
    
    if (!(end >= start)) return result;

    let rangeItem;
    for (let i = 0; i <= data.length; i++) {
      rangeItem = data[i];
      if (!rangeItem) {
        result.push([start, end]);
      } else if (rangeItem[0] - this.precision >= start) {
        result.push([start, Math.min(end, rangeItem[0] - this.precision)]);
        start = rangeItem[1] + this.precision;
        if (start > end) break;
      } else if (rangeItem[1] >= start) {
        start = rangeItem[1] + this.precision;
      }
    }

    return result;
  }
}