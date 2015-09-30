var Prismic = require('prismic.io').Prismic,
    Configuration = require('./prismic-configuration').Configuration,
    http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring');

exports.previewCookie = Prismic.previewCookie;

// -- Helpers

exports.getApiHome = function(accessToken, callback) {
  Prismic.Api(Configuration.apiEndpoint, callback, accessToken);
};

exports.getDocument = function(ctx, id, slug, onSuccess, onNewSlug, onNotFound) {
  ctx.api.forms('everything').ref(ctx.ref).query('[[:d = at(document.id, "' + id + '")]]').submit(function(err, documents) {
    var results = documents.results;
    var doc = results && results.length ? results[0] : undefined;
    if (err) onSuccess(err);
    else if(doc && (!slug || doc.slug == slug)) onSuccess(null, doc)
    else if(doc && doc.slugs.indexOf(slug) > -1 && onNewSlug) onNewSlug(doc)
    else if(onNotFound) onNotFound()
    else onSuccess();
  });
};

exports.getDocuments = function(ctx, ids, callback) {
  if(ids && ids.length) {
    ctx.api.forms('everything').ref(ctx.ref).query('[[:d = any(document.id, [' + ids.map(function(id) { return '"' + id + '"';}).join(',') + '])]]').submit(function(err, documents) {
      callback(err, documents.results);
    });
  } else {
    callback(null, []);
  }
};

// get next pages recursively.
function getPages(ctx, pages, errors, page, callback) {
    var getNextPage  = function(ctx, previousPages, previousErrors, page, maxPages) {
        ctx.api.forms('everything').ref(ctx.ref).query('[[:d = at(document.type, "page")]]').pageSize(2).page(page).submit(function (err, response) {
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
            //var home = pages.homeId
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
        group.toArray().forEach(function(item) {
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
            ref: req.cookies[Prismic.experimentCookie] || req.cookies[Prismic.previewCookie] || Api.master(),
            linkResolver: function(doc) {
              return Configuration.linkResolver(doc);
            }
          };
      res.locals.ctx = ctx;
      callback(req, res, ctx);
    });
  };
};