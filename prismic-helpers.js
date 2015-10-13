var Prismic = require('prismic.io').Prismic,
    Configuration = require('./prismic-configuration').Configuration,
    http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring');

// -- Helpers

exports.getApiHome = function(accessToken, callback) {
  Prismic.Api(Configuration.apiEndpoint, callback, accessToken);
};


// get next pages recursively.
function getPages(ctx, pages, errors, page, callback) {
    var getNextPage  = function(ctx, previousPages, previousErrors, page, maxPages) {
        ctx.api.forms('everything').ref(ctx.ref).query('[[:d = any(document.type, ["page", "bloghome"])]]').pageSize(2).page(page).submit(function (err, response) {
            if (response) {
                var mergedPages = previousPages.concat(response.results),
                    mergedErrors = previousErrors.concat(err)
                if (response.next_page && maxPages > 0) {
                    getNextPage(ctx, mergedPages, mergedErrors, page + 1, maxPages -1)
                } else {
                    callback(mergedErrors, mergedPages);
                }
            } else {
                callback(previousErrors, previousPages);
            }
        })
    }
    getNextPage(ctx, pages, errors, page, 99)
}

exports.home = home;

function home(ctx, bookmark, callback) {
    var homeId = ctx.api.bookmarks[bookmark]
    if (!homeId) {
        return []
    } else {
        getAllPages(ctx, function(errors, pages) {
            var home = pages.filter(function(obj) {return obj.id == homeId})[0]
            if (!home) {
                callback([])
            } else {
              var obj = {
                  label: 'Home',
                  url: ctx.linkResolver(home),
                  external: false,
                  children: getPageChildren(ctx, home, pages)
              }
              callback(obj)
            }
        })
    }
}

function getPageChildren(ctx, page, pages) {
    var path = page.type + '.children'
    var group = page.get(path)
    if (group) {
        var childrenById = [];
        group.toArray().forEach(function(item) {
            var link = item.getLink('link');
            if (link instanceof Prismic.Fragments.DocumentLink) {
                var foundPage = pages.filter(function(obj) {return obj.id == link.id})[0]
                if (foundPage) {
                    childrenById[link.id] = foundPage;
                }
            }
        })
        var result = []
        group.toArray().filter(function(item) {return !!item.getLink('link')}).forEach(function(item) {
            var label = item.getText('label');
            var link = item.getLink('link');
            var children = []
            if (link instanceof Prismic.Fragments.DocumentLink && !link.isBroken) {
                var getPageIfExists = pages.filter(function(obj) {return obj.id == link.id})[0]
                if (getPageIfExists) {
                    var doc = childrenById[link.id];
                    if (!label) {
                        label = 'No label';
                    }
                    children = getPageChildren(ctx, doc, pages);
                }
            }

            var obj = {
                label: label,
                url: ctx.linkResolver(link),
                external: link instanceof Prismic.Fragments.WebLink,
                children: children

            }
            result.push(obj)

        })
        return result;
    }
}

exports.getAllPages = getAllPages

function getAllPages(ctx, callback) {
     getPages(ctx, [], [], 0, callback)
}

exports.getBookmark = function(ctx, bookmark, callback) {
  var id = ctx.api.bookmarks[bookmark];
  if(id) {
    exports.getDocument(ctx, id, undefined, callback);
  } else {
    callback();
  }
};

// -- Exposing as a helper what to do in the event of an error (please edit prismic-configuration.js to change this)
exports.onPrismicError = Configuration.onPrismicError;

// -- Route wrapper that provide a "prismic context" to the underlying function

exports.route = function(callback) {
  return function(req, res) {
    var accessToken = (req.session && req.session['ACCESS_TOKEN']) || Configuration.accessToken;
    exports.getApiHome(accessToken, function(err, Api) {
      if (err) {
          exports.onPrismicError(err, req, res);
          return;
      }
      var ctx = {
        api: Api,
        ref: req.cookies[Prismic.experimentCookie] || req.cookies[Prismic.previewCookie] || Api.master()
      }
      getAllPages(ctx, function (errors, pages) {
        var homeId = ctx.api.bookmarks["home"]
        var bloghomeId = ctx.api.bookmarks["bloghome"]
        var childrenParents = buildChildParentDict(pages, homeId, bloghomeId)
        var linkResolver = function(doc) {
          var parentUid = childrenParents[doc.uid]
          return Configuration.linkResolver(ctx, doc, parentUid);
        }
        ctx.linkResolver = linkResolver
        res.locals.ctx = ctx;
        callback(req, res, ctx);
      })
    });
  };
};

exports.pagePath = pagePath

function pagePath(uid, parentUid) {
  if(parentUid) {
    var path = [parentUid, uid].map(function(piece) {return encodeURIComponent(piece)}).join('\/')
    return path
  } else return uid
}

function buildChildParentDict(pages, homeId, bloghomeId) {
    var childParent = {}
    pages.forEach(function(page) {
      if(page.id != homeId) {
        var localPath = page.type + '.children'
        var group = page.get(localPath)
        if (group && group.toArray().length > 0) {
          var items = group.toArray()
          items.forEach(function(item) {
            if (item) {
              var link = item.getLink('link')
              if (link) {
                var parentTitle = null;
                if (link.id == bloghomeId) {
                  parentTitle = 'blog'
                } else parentTitle = page.uid;
                childParent[link.uid] = parentTitle
              }
            }
          })
        }
      }
    })
    return childParent
}