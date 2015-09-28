var utils = require('../includes/utils');


exports.pageUrl = function(req){
    return function(doc) {
        var host = req.get('host')
        var scheme = "http://";
        return scheme + host + '/' + doc.uid
    }
}

exports.defaultImage = defaultImage

function defaultImage (doc) {
    if (!doc) {
        return;
    }
    var images = getImagesFromDoc(doc)
    return utils.findFirstValid(images).getView('main').url
}
exports.defaultDescription = defaultDescription

function defaultDescription (doc) {
    if (!doc) {
        return;
    }
    var firstStructuredText = utils.findFirstValid(getStructuredTextsFromDoc(doc))
    return getDescriptionFromStructuredText(firstStructuredText)
}

exports.emailTitle = function(doc) {
    var allEmails = emails(doc)
    var email = firstValidEmail(allEmails)
    return (email && email.get('card_title')) ? email.get('card_title').value : defaultTitle(doc)
}

exports.emailDescription = function(doc) {
    var allEmails = emails(doc)
    var email = firstValidEmail(allEmails)
    return (email && email.get('card_description')) ? email.get('card_description').value : defaultDescription(doc)
}

function firstValidEmail(emails) {
    if (emails) {
        return utils.findFirstValid(emails)
    }
}

exports.isShareReady = function(doc) {
    var socialData = social(doc);
    return socialData && socialData.length > 0;
}


exports.openGraphCardExists = function(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        return utils.exists(socialSlices, function(slice) {
            return isOpenGraphCard(slice.sliceType)
        })
    }
    return false;
}

function isOpenGraphCard(sliceType) {
    return (sliceType == 'general_card' || sliceType == 'product_card' || sliceType == 'place_card');
}

exports.twitterCardExists = function(doc) {
    var socialSlices = social(doc);

    if(socialSlices) {
        return utils.exists(socialSlices, function(slice) {
            return isTwitterCard(slice.sliceType)
        })
    }
    return false;
}


function isTwitterCard(sliceType) {
    return (sliceType == 'twitter_app' || sliceType == 'twitter_summary' || sliceType == 'twitter_summary_large');
}

exports.twitterCardType = function(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var foundSlice = utils.findFirst(socialSlices, function(slice) {
            return isTwitterCard(slice.sliceType)
        })
        return foundSlice.sliceType
    }
}
function twitterSummary(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var foundSlice = utils.findFirst(socialSlices, function(slice) {
            return slice.sliceType == 'twitter_summary'
        })
        return foundSlice
    }
}

exports.twitterSummarySite = function(doc) {
    return twitterSummary(doc).value.toArray()[0].get('twitter_site') ? twitterSummary(doc).value.toArray()[0].get('twitter_site').value : '';
}

exports.twitterSummaryTitle = function(doc) {
    return twitterSummary(doc).value.toArray()[0].get('card_title') ? twitterSummary(doc).value.toArray()[0].get('card_title').value : defaultTitle();
}

exports.twitterSummaryDescription = function(doc) {
    return twitterSummary(doc).value.toArray()[0].get('card_description') ? twitterSummary(doc).value.toArray()[0].get('card_description').value : defaultDescription();
}


exports.twitterSummaryImage = function(doc) {
    return twitterSummary(doc).value.toArray()[0].get('card_image') && twitterSummary(doc).value.toArray()[0].get('card_image').getView("main") ? twitterSummary(doc).value.toArray()[0].get('card_image').getView("main").url : defaultImage(doc);
}



function twitterSummaryLarge(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var foundSlice = utils.findFirst(socialSlices, function(slice) {
            return slice.sliceType == 'twitter_summary_large'
        })
        return foundSlice
    }
}

exports.twittersummaryLargeTitle = function(doc) {
    return twitterSummaryLarge(doc).value.toArray()[0].get('card_title') ? twitterSummaryLarge(doc).value.toArray()[0].get('card_title').value : defaultTitle();
}

exports.twitterSummaryLargeDescription = function(doc) {
    return twitterSummaryLarge(doc).value.toArray()[0].get('card_description') ? twitterSummaryLarge(doc).value.toArray()[0].get('card_description').value : defaultDescription();
}

exports.twitterSummaryLargeImage = function(doc) {
    return twitterSummaryLarge(doc).value.toArray()[0].get('card_image') && twitterSummaryLarge(doc).value.toArray()[0].get('card_image').getView("main") ? twitterSummaryLarge(doc).value.toArray()[0].get('card_image').getView("main").url : defaultImage(doc);
}

exports.twitterSummaryLargeSite = function(doc) {
    return twitterSummaryLarge(doc).value.toArray()[0].get('twitter_site') ? twitterSummaryLarge(doc).value.toArray()[0].get('twitter_site').value : '';
}

exports.twitterSummaryLargeCreator = function(doc) {
    return twitterSummaryLarge(doc).value.toArray()[0].get('twitter_creator') ? twitterSummaryLarge(doc).value.toArray()[0].get('twitter_creator').value : '';
}

function twitterApp(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var foundSlice = utils.findFirst(socialSlices, function(slice) {
            return slice.sliceType == 'twitter_app'
        })
        return foundSlice
    }
}

exports.twitterAppSite = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('twitter_site') ? twitterApp(doc).value.toArray()[0].get('twitter_site').value : '';
}

exports.twitterAppCreator = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('twitter_creator') ? twitterApp(doc).value.toArray()[0].get('twitter_creator').value : '';
}

exports.twitterAppCountry = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('app_country') ? twitterApp(doc).value.toArray()[0].get('app_country').value : '';
}

exports.twitterAppIphoneName = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('iphone_name') ? twitterApp(doc).value.toArray()[0].get('iphone_name').value : '';
}

exports.twitterAppIphoneId = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('iphone_id') ? twitterApp(doc).value.toArray()[0].get('iphone_id').value : '';
}

exports.twitterAppIphoneUrl = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('iphone_url') ? twitterApp(doc).value.toArray()[0].get('iphone_url').value : '';
}

exports.twitterAppIpadName = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('iphone_url') ? twitterApp(doc).value.toArray()[0].get('iphone_url').value : '';
}

exports.twitterAppIpadId = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('ipad_id') ? twitterApp(doc).value.toArray()[0].get('ipad_id').value : '';
}

exports.twitterAppIpadUrl = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('ipad_url') ? twitterApp(doc).value.toArray()[0].get('ipad_url').value : '';
}

exports.twitterAppIpadUrl = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('ipad_url') ? twitterApp(doc).value.toArray()[0].get('ipad_url').value : '';
}

exports.twitterAppAndroidName = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('android_name') ? twitterApp(doc).value.toArray()[0].get('android_name').value : '';
}

exports.twitterAppAndroidId = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('android_id') ? twitterApp(doc).value.toArray()[0].get('android_id').value : '';
}

exports.twitterAppAndroidUrl = function(doc) {
    return twitterApp(doc).value.toArray()[0].get('android_url') ? twitterApp(doc).value.toArray()[0].get('android_url').value : '';
}

exports.openGraphCardType = function(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = utils.findFirst(socialSlices, function(slice) {
            return isOpenGraphCard(slice.sliceType)
        })
        return slice.sliceType
    }
}

function generalCard(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var slice = utils.findFirst(socialSlices, function(slice) {
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
        var slice = utils.findFirst(socialSlices, function(slice) {
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
    return productCard(doc).value.toArray()[0].get('card_image0') && productCard(doc).value.toArray()[0].get('card_image0').getView("main") ? productCard(doc).value.toArray()[0].get('card_image0').getView("main").url : defaultImage(doc);
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
        var slice = utils.findFirst(socialSlices, function(slice) {
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
    return utils.flattenArray(images)
}

function getImagesFromSliceZone(sliceZone) {
    var imagesInSliceZone =  sliceZone.map(function(slice) {
        return getImagesFromSlice(slice)
    })

    return utils.flattenArray(imagesInSliceZone)
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
    var imagesFlattened = utils.flattenArray(itemsImages)
    return imagesFlattened
}

function getFirstImageFromStructuredText(structuredText) {
    if(structuredText.getFirstImage && structuredText.getFirstImage()) {
        return structuredText.getFirstImage();
    } else return;
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
    return utils.flattenArray(structuredTexts.filter(function(st) {return !!st}))

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
        var structureTextsFlattened = utils.flattenArray(itemsStructuredText)
        return structureTextsFlattened
    })
    return utils.flattenArray(structureTextsInSliceZone)
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

function emails(doc) {
    var socialSlices = social(doc);
    if(socialSlices) {
        var emailSlices =  socialSlices.map(function(slice) {
            if (slice.sliceType == 'email') {
                return slice.value.toArray()
            }
        })
        return utils.flattenArray(emailSlices)
    }
}

function defaultTitle(doc) {
    if (!doc) {
        return;
    }
    var firstStructuredText = utils.findFirstValid(getStructuredTextsFromDoc(doc))
    return getTitleFromStructuredText(firstStructuredText)
}

function getTitleFromStructuredText(structuredText) {
    if(structuredText) {
        if (structuredText.getTitle()) {
            return structuredText.getTitle()
        }
    }
}