
/**
 * 时间格式化
 * 例：formatDate(1462434312000, 'yy/MM/dd')  返回  16/05/05
 */
export default function formatDate(timestamp, str) {
  if (!timestamp) return '';
  var date = new Date(timestamp);
  var obj = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  str = str.replace(/y+/g, function(match) {
    return (date.getFullYear() + '').substr(4 - match.length)
  });
  for (var key in obj) {
    str = str.replace(new RegExp(key, 'g'), function (match) {
      return (match.length === 1) ? (obj[key]) : ('00' + obj[key]).substr(('' + obj[key]).length);
    });
  }
  return str;
}