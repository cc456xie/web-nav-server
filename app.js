var createError = require('http-errors');
var express = require('express');
var path = require('path');
// 引入cookie模块
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var addRouter = require('./routes/add');
var app = express();

// CORS跨域
app.all('*', function(req, res, next) {
  console.log(req.get('origin'));
  res.set('Access-Control-Allow-Origin', req.get('origin'));
  // res.header("Access-Control-Allow-Origin", "localhost:80");
  res.header('Access-Control-Allow-Headers', 'Content-type');
  res.header('Access-Control-Allow-Credentials',true);
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
  res.header('Access-Control-Max-Age',1728000);//预请求缓存20天
  next();  
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('chenchen'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/add', addRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
