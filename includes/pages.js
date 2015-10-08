var social = require('../includes/social');


exports.pageLink = function(page, currentPageUrl) {
    var active = page.url == currentPageUrl
    var classes = []
    if (active) {
        classes.push('active')
    }
    if (page.external == true) {
        classes.push('external')
    }

    return '<a href="' + '/' +  page.url + '" class="' + classes.join(' ') + '">' + page.label + '</a>'
}

exports.getHomeChildren = function(home) {
    if (home.children) {
        return home.children
    }
}