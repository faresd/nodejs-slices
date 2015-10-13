
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    prismic = require('./prismic-helpers'),
    prismic1 = require('express-prismic').Prismic,
    configuration = require('./prismic-configuration').Configuration;


social = require('./includes/social');

var app = express();

// Prismic.io configuration

prismic1.init(configuration);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

// Routes
app.route('/').get(routes.index);
app.route('/preview').get(routes.preview);

//[TODO: a quick solution to handle a child page, should introduce a better dynamic way to handel multiple levels children].
app.route('/:uid/:subuid*?').get(routes.page);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});

