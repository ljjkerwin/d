import localforage from 'localforage';


window.localforage = localforage;




function getData() {
  var b100 = '0123456789012345689012345678901234567890123456789';
  // 1k
  var res = '';
  for(var i =0;i< 100;i++){
  res +=b100;
  }
  return res;
  // 100k
}



var data = getData();


window.add = function () {
  for (var i = 0; i< 3; i++) {
    var lf = localforage.createInstance({
      name: Math.floor(Math.random()*1000000) + "",
    });

    for (var j = 0; j< 2;j++) {
      lf.setItem(j+'', data)
    }

  }
}


class LFM {
  constructor(config) {
    typeof config === 'object' || (config = {});
    this.config = config;
    this.namespace = config.namespace || 'localforageManager';

    this.cleanOldData();
  }

  cleanOldData() {
    if (!this.config.duraction) return;

    // 按时间排序
    let map = this.get('map');
    let arr = [];
    for (let i in map) {
      arr.push(map[i]);
    }
    arr.sort((l, r) => {
      return r.lastUseTime - l.lastUseTime;
    });
    console.log(arr.map(a=>a.lastUseTime))

    // 保鲜时间
    var intervalTime = Date.now() - this.config.duraction;console.log(intervalTime)
    arr.forEach(j => {
      if (!(j.lastUseTime > intervalTime)) {
        try {
          window.indexedDB && window.indexedDB.deleteDatabase(j.name);
          this.mapDel(j.name);
        } catch (e) {
          console.warn(e);
        }
      }
    });
  }

  get(k) {
    let res = localStorage.getItem(this.namespace + '_' + k);
    try {
      res = JSON.parse(res);
    } catch (e) {
      console.log(e);
    }
    return res;
  }
  set(k, v) {
    return localStorage.setItem(this.namespace + '_' + k, JSON.stringify(v));
  }
  mapShow() {
    let map = this.get('map') || {};
    console.log(map);
  }
  mapSet(k, v) {
    let map = this.get('map');
    map || (map = {});
    map[k] = v;
    this.set('map', map);
  }

  mapDel(k) {
    let map =  this.get('map');
    map || (map = {});
    delete map[k];
    this.set('map', map);
  }
}

class LFI {
  constructor(name) {
    name && this.init(name)
  }
  init(name) {
    this.lf = localforage.createInstance({
      name
    });
    lfm.mapSet(name, {
      name,
      lastUseTime: Date.now(),
    });
  }
  add() {
    this.lf.setItem(Math.random() + '', true);
  }
}

window.lfm = new LFM({
  namespace: 'kf',
  duraction: 1000 * 20,
});

window.lfi = new LFI('kf_' + Math.random());
lfi.add()