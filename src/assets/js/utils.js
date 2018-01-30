export function resolveKeyValuePairs (str, seperator=',') {
	var res = {};
	var re = /(.+)=(.+)/;
	var arr = str.split(seperator);
	for (var i = 0; i < arr.length; i++) {
		var match = arr[i].trim().match(re);
		res[match[1]] = match[2];
	}
	return res
}

/**
 * 根据某个属性值（数值型）将数组中的对象集合从小到大排序，返回排序后的数组
 */
export function sortArrayofObjects (arr, property) {
  for (var i = 0, len = arr.length; i < len - 1; i++) {
    var min = i;
    for (var j = i + 1; j < len; j++) {
      if (arr[j][property] < arr[min][property]) {
        min = j
      }
    }
    var temp = arr[i];
    arr[i] = arr[min];
    arr[min] = temp;
  }
  return arr
}