require('dotenv').config();
var express = require('express');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');

const AuthService = require('./services/Auth')
var IndexRouter = require('./routes/Index');
var UserIndexRoute = require('./routes/user/Index');

// MONGODB
require('./starts/mongo');

var { grpcAccount, grpcAccountMiddleware, grpcCoin, grpcCoinMiddleware } = require('./starts/grpc');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());  //This middleware will allow us to pull req.body.<params>
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
// http://localhost:3000/static/images/image.jpeg
// http://localhost:3000/static/css/style.css
// http://localhost:3000/static/js/app.js

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.get('/test', (req, res) => {
    res.json({"message": "Hello Crud Node Express"});
});


// API V1 ROUTES

app.use('/v1/', grpcAccountMiddleware, IndexRouter);
app.use('/v1/user', AuthService.checkAccessToken, grpcAccountMiddleware, grpcCoinMiddleware, UserIndexRoute);




//app.use('/seed', SeedRoute);  // ALERT IN PRODUCTION !!!!!!!!!!!!!!!!!!!

/* app.use('/user__', AuthService.checkAccessToken, UserRoute, (req, res) => {
  console.log('Request URL:', req.originalUrl)
  console.log('Request Type:', req.method)
  //res.sendStatus(401)
  res.status(401).json({
    status: false,
    error: {
        message: req.app.get('env') === 'development' ? "chain checkAccessToken error" : {},
    }
  });
})

app.use('/chain', AuthService.checkAccessToken, ChainRoute, (req, res) => {
  console.log('Request URL:', req.originalUrl)
  console.log('Request Type:', req.method)
  //res.sendStatus(401)
  res.status(401).json({
    status: false,
    error: {
        message: req.app.get('env') === 'development' ? "chain checkAccessToken error" : {},
    }
  });
})

app.use('/admin', AuthService.checkAccessToken, AuthService.checkAdminAccessToken, ChainRoute, (req, res) => {
  console.log('Request URL:', req.originalUrl)
  console.log('Request Type:', req.method)
  //res.sendStatus(401)
  res.status(401).json({
    status: false,
    error: {
        message: req.app.get('env') === 'development' ? "admin checkAccessToken error" : {},
    }
  });
}) */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  res.status(err.status || 500).json({
    status: false,
    error: req.app.get('env') === 'development' ? err : {},
  });


  // set locals, only providing error in development
  /* res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error'); */
});

module.exports = app;
