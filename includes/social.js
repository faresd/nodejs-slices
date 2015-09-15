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


exports.isShareReady = function(doc) {
    var socialData = social(doc);
    return socialData && socialData.length > 0;
}


exports.openGraphCardExists = function(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = exists(socialSlices, function(slice) {
            return isOpenGraphCard(slice.sliceType)
        })
        return slice
    }
    return false;
}

function exists(array, funktion) {
    var i = array.length;
    while (i--) {
        if (funktion(array[i])) {
            return true;
        }
    }
}


function findFirst(array, funktion) {
    var i = array.length;
    while (i--) {
        if (funktion(array[i])) {
            return array[i];
        }
    }
}

exports.openGraphCardType = function(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = findFirst(socialSlices, function(slice) {
            return isOpenGraphCard(slice.sliceType)
        })
        return slice.sliceType
    }
}

function generalCard(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = findFirst(socialSlices, function(slice) {
            return slice.sliceType == "general_card"
        })
        return slice
    }
}


exports.generalCardTitle = function(doc) {
    return generalCard(doc).value.toArray()[0].get('card_title') ? generalCard(doc).value.toArray()[0].get('card_title').value : defaultTitle(doc);
}

exports.generalCardImage = function(doc) {
    return generalCard(doc).value.toArray()[0].get('card_image') && generalCard(doc).value.toArray()[0].get('card_image').getView("main") ? generalCard(doc).value.toArray()[0].get('card_image').getView("main").url : defaultImage(doc);
}

exports.generalCardDescription = function(doc) {
    return generalCard(doc).value.toArray()[0].get('card_description') ? generalCard(doc).value.toArray()[0].get('card_description').value : defaultDescription(doc);
}


function productCard(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = findFirst(socialSlices, function(slice) {
            return slice.sliceType == "product_card"
        })
        return slice
    }
}


exports.productCardTitle = function(doc) {
    return productCard(doc).value.toArray()[0].get('card_title') ? productCard(doc).value.toArray()[0].get('card_title').value : defaultTitle(doc);
}

exports.productCardDescription = function(doc) {
    return productCard(doc).value.toArray()[0].get('card_description') ? productCard(doc).value.toArray()[0].get('card_description').value : defaultDescription(doc);
}

exports.productCardAmount = function(doc) {
    return productCard(doc).value.toArray()[0].get('card_amount') ? productCard(doc).value.toArray()[0].get('card_amount').value : '';
}

exports.productCardCurrency = function(doc) {
    return productCard(doc).value.toArray()[0].get('card_currency') ? productCard(doc).value.toArray()[0].get('card_currency').value : '';
}

exports.productCardSingleImage = function(doc) {
    return productCard(doc).value.toArray()[0].get('card_image0') ? productCard(doc).value.toArray()[0].get('card_currency').value : '';
}



exports.productCardImages =  function(doc){
    var imagesUrls = getImagesFromSlice(productCard(doc)).map(function(image) {
        return image.getView('main').url
    })

    return '[' +  imagesUrls.join() + ']';
}

function placeCard(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = findFirst(socialSlices, function(slice) {
            return slice.sliceType == "place_card"
        })
        return slice
    }
}


exports.placeCardTitle = function(doc) {
    return placeCard(doc).value.toArray()[0].get('card_title') ? placeCard(doc).value.toArray()[0].get('card_title').value : defaultTitle(doc);
}

exports.placeCardDescription = function(doc) {
    return placeCard(doc).value.toArray()[0].get('card_description') ? placeCard(doc).value.toArray()[0].get('card_description').value : defaultDescription(doc);
}

exports.placeCardLatitude = function(doc) {
    return placeCard(doc).value.toArray()[0].get('coordinates') ? placeCard(doc).value.toArray()[0].get('coordinates').latitude: defaultDescription(doc);
}

exports.placeCardLongitude = function(doc) {
    return placeCard(doc).value.toArray()[0].get('coordinates') ? placeCard(doc).value.toArray()[0].get('coordinates').longitude: defaultDescription(doc);
}

exports.placeCardImage = function(doc) {
    return placeCard(doc).value.toArray()[0].get('card_image') && placeCard(doc).value.toArray()[0].get('card_image').getView("main") ? placeCard(doc).value.toArray()[0].get('card_image').getView("main").url : defaultImage(doc);
}




function isOpenGraphCard(sliceType) {
    return (sliceType == 'general_card' || sliceType == 'product_card' || sliceType == 'place_card');
}

function getImagesFromDoc(doc) {
    var images = Object.keys(doc.fragments).map(function(key) {
        if (doc.fragments[key].type == "SliceZone") {
            var sliceZone = doc.getSliceZone(key).value
            return getImagesFromSliceZone(sliceZone);
        } else if (doc.fragments[key].type == "StructuredText") {
            var structuredText = doc.getStructuredText(key)
            return [getFirstImageFromStructuredText(structuredText)]
        } else if (doc.fragments[key].type == "Image") {
            return [item.get(key)]

        } else return []
    })
    return flattenArray(images)
}

function getImagesFromSliceZone(sliceZone) {
    var imagesInSliceZone =  sliceZone.map(function(slice) {
        return getImagesFromSlice(slice)
    })

    return flattenArray(imagesInSliceZone)
}

function getImagesFromSlice(slice) {
    var items = slice.value.toArray()
    var itemsImages = items.map(function (item) {
        var images = Object.keys(item.fragments).map(function(key) {
            if (item.fragments[key].type == "StructuredText") {
                var structuredText = item.getStructuredText(key)
                return getFirstImageFromStructuredText(structuredText)
            } else if (item.fragments[key].type == "Image") {
                return item.get(key)

            } else return;
        })
        return images.filter(function(image) {return !!image})
    })
    var imagesFlattened = flattenArray(itemsImages)
    return imagesFlattened
}

function getFirstImageFromStructuredText(structuredText) {
    if(structuredText.getFirstImage && structuredText.getFirstImage()) {
        return structuredText.getFirstImage();
    } else return;
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
    return flattenArray(structuredTexts.filter(function(st) {return !!st}))


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