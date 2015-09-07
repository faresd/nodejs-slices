exports.pageUrl = function(req){
    return function(doc) {
        var host = req.get('host')
        var scheme = "http://";
        return scheme + host + '/' + doc.uid
    }
}

exports.defaultImage = function(doc) {
    var image = Object.keys(doc.fragments).map(function(key) {
        var fragment = doc.fragments[key]
        if (fragment.type == "SliceZone") {
            var sliceZone = doc.getSliceZone("page.body").value;
            var firstImage =  getImagesFromSliceZone(sliceZone)[0]
            return firstImage.getView("main").url
        } else if (fragment.type == "Image") {
            getImageFromFragmentImage(fragment)
        } else if (fragment.type == "StructuredText") {
            var structuredText = doc.getStructuredText('page.title')
            if(structuredText.getFirstImage() && structuredText.getFirstImage().getView("main")) return structuredText.getFirstImage().getView("main").url;
        }
    })
    return image;
}


function arrayFlatten(array) {
    return [].concat.apply([], array)
}


function getImagesFromSliceZone(sliceZone) {
    var imagesInSliceZone =  sliceZone.map(function(slice) {
        var items = slice.value.toArray()
        var itemsImages = items.map(function (item) {
            var imageKeys = Object.keys(item.fragments).filter(function(key){
                return (item.fragments[key].type == "Image")
            })
            var images = imageKeys.map(function(key) {
                return item.get(key)
            })
            return images;
        })
        var imagesFlattened = arrayFlatten(itemsImages)
        return imagesFlattened
    })
    return arrayFlatten(imagesInSliceZone)
}


function getImageFromFragmentImage(fragment) {
    if(fragment) return fragment.getView("main").url
}