
exports.exists = function(array, funktion) {
    var i = array.length;
    while (i--) {
        if (funktion(array[i])) {
            return true;
        }
    }
}


exports.findFirst  = function(array, funktion) {
    var i = array.length;
    while (i--) {
        if (funktion(array[i])) {
            return array[i];
        }
    }
}


exports.findFirstValid  = function(array) {
    var firstValid = null;
    for (var i = 0; i < array.length; i++) {
        if (array[i] != undefined){
            firstValid = array[0]
            break;
        }
    }

    return firstValid;
}

exports.flattenArray = function(array) {
    return [].concat.apply([], array)
}
