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
            var sliceZone = doc.getSliceZone(doc.type + '.body').value;
            var firstImage =  getImagesFromSliceZone(sliceZone)[0]
            return firstImage.getView("main").url
        } else if (fragment.type == "Image") {
            getImageFromFragmentImage(fragment)
        } else if (fragment.type == "StructuredText") {
            var structuredText = doc.getStructuredText(doc.type + '.title')
            if(structuredText.getFirstImage() && structuredText.getFirstImage().getView("main")) return structuredText.getFirstImage().getView("main").url;
        }
    })
    return image;
}

exports.defaultDescription = function(doc) {
    if (!doc) {
        return;
    }
    Object.keys(doc.fragments).map(function(key) {
        var fragment = doc.fragments[key]
        var firstStructuredText = getStructuredTextsFromDoc(doc, fragment)[0]
        return getDescriptionFromStructuredText(firstStructuredText)
    })
}

exports.emailTitle = function(doc) {
    return (email(doc) && email(doc)[0].get('card_title')) ? email(doc)[0].get('card_title').value : ''
}


function flattenArray(array) {
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
        var imagesFlattened = flattenArray(itemsImages)
        return imagesFlattened
    })
    return flattenArray(imagesInSliceZone)
}


function getImageFromFragmentImage(fragment) {
    if(fragment) return fragment.getView("main").url
}

function getStructuredTextsFromDoc(doc, fragment) {
    if (fragment.type == "SliceZone") {
        var sliceZone = doc.getSliceZone(doc.type + '.body').value
        return getStructuredTextsFromSliceZone(sliceZone);
    } else if (fragment.type == "StructuredText") {
        return [doc.getStructuredText(doc.type + '.title')]
    } else return []
}

function getStructuredTextsFromSliceZone(sliceZone) {
    var structureTextsInSliceZone =  sliceZone.map(function(slice) {
        var items = slice.value.toArray()
        var itemsStructuredText = items.map(function (item) {
            var structureTextKeys = Object.keys(item.fragments).filter(function(key){
                return (item.fragments[key].type == "StructuredText")
            })
            var structureTexts = structureTextKeys.map(function(key) {
                return item.get(key)
            })
            return structureTexts;
        })
        var structureTextsFlattened = flattenArray(itemsStructuredText)
        return structureTextsFlattened
    })
    return flattenArray(structureTextsInSliceZone)
}

function getDescriptionFromStructuredText(structuredText) {
    if(structuredText) {
        if (structuredText.getFirstParagraph()) {
            return structuredText.getFirstParagraph().text;
        } else return structuredText.asText()
    }
}

function social(doc) {
    if(!doc) {
        return;
    }
    var socialData = doc.getSliceZone(doc.type + '.social').value;
    if(socialData) {
        return socialData;
    }
}

function email(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var emailSlices =  socialSlices.map(function(slice) {
            if (slice.sliceType == 'email') {
                return slice.value.toArray()
            }
        })
        return flattenArray(emailSlices)
    }
}