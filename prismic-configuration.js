var prismic = require('./prismic-helpers');

exports.Configuration = {

  apiEndpoint: 'http://fares2test.prismic.io/api',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  linkResolver: function(ctx, doc, callback) {
    if (doc.isBroken) callback(null);

    if (doc.type == "page")  {
      var homeId = ctx.api.bookmarks['home']
      if (doc.id == homeId) {
        callback('/')
      } else {
        prismic.pagePath(ctx, doc.uid, function(path) {

        });

      }
    }

    return '/documents/' + doc.id + '/' + doc.slug;
  },
  linkResolverFromPages: function(ctx, doc, pages) {
    if (doc.isBroken) callback(null);

    if (doc.type == "page")  {
      var homeId = ctx.api.bookmarks['home']
      if (doc.id == homeId) {
        return '/'
      } else {
        var path = prismic.pagePathFromPages(doc.uid, pages)
        return path

      }
    }

    return '/documents/' + doc.id + '/' + doc.slug;
  },

  // -- What to do in the event of an error from prismic.io
  onPrismicError: function(err, req, res) {
    res.status(500)
        .send("Error 500: " + err.message);
  }

};