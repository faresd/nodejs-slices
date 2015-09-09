exports.pageUrl = function(req){
    return function(doc) {
        var host = req.get('host')
        var scheme = "http://";
        return scheme + host + '/' + doc.uid
    }
}

exports.defaultImage = function(doc) {
    if (!doc) {
        return;
    }
    var images = getImagesFromDoc(doc)
    return findFirstValid(images).getView('main').url
}

exports.defaultDescription = function(doc) {
    if (!doc) {
        return;
    }
    var firstStructuredText = findFirstValid(getStructuredTextsFromDoc(doc))
    return getDescriptionFromStructuredText(firstStructuredText)
}

exports.emailTitle = function(doc) {
    return (email(doc) && email(doc)[0].get('card_title')) ? email(doc)[0].get('card_title').value : defaultTitle(doc)
}

exports.emailDescription = function(doc) {
    return (email(doc) && email(doc)[0].get('card_description')) ? email(doc)[0].get('card_description').value : defaultDescription(doc)
}

function getImagesFromDoc(doc) {
    var images = Object.keys(doc.fragments).map(function(key) {
        if (doc.fragments[key].type == "SliceZone") {
            var sliceZone = doc.getSliceZone(key).value
            return getImagesFromSliceZone(sliceZone);
        } else if (doc.fragments[key].type == "StructuredText") {
            var structuredText = doc.getStructuredText(key)
            if(structuredText.getFirstImage() && structuredText.getFirstImage()) {
                return [structuredText.getFirstImage()];
            } else return []
        } else return []
    })
    return flattenArray(images)
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

function findFirstValid(array) {
    var firstValid = null;
    for (var i = 0; i < array.length; i++) {
        if (array[i] != undefined){
            firstValid = array[0]
            break;
        }
    }

    return firstValid;
}

function flattenArray(array) {
    return [].concat.apply([], array)
}


function getStructuredTextsFromDoc(doc) {
    var structuredTexts = Object.keys(doc.fragments).map(function(key) {
        if (doc.fragments[key].type == "SliceZone") {
            var sliceZone = doc.getSliceZone(key).value
            return getStructuredTextsFromSliceZone(sliceZone);
        } else if (doc.fragments[key].type == "StructuredText") {
            return [doc.getStructuredText(key)]
        } else return []
    })
    return flattenArray(structuredTexts)


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

function defaultTitle(doc) {
    if (!doc) {
        return;
    }
    var firstStructuredText = findFirstValid(getStructuredTextsFromDoc(doc))
    return getTitleFromStructuredText(firstStructuredText)
}

function getTitleFromStructuredText(structuredText) {
    if(structuredText) {
        if (structuredText.getTitle()) {
            return structuredText.getTitle()
        }
    }
}