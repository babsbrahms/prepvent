var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path')
var cors = require('cors');
require('dotenv').config()

var app = express();

const event = require('./route/event');
const user = require('./route/user');
const register = require('./route/register');
const promotion = require('./route/promotion');
const country = require('./route/country')



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


// mongoose
mongoose.connect('mongodb://localhost:27017/prepvent', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
let mdb = mongoose.connection;

mdb.once('open', () => {
    console.log('mongo connected');  
    require('./utils/helper/country')
})

mdb.on('error', (err) => {
    console.log(err);  
})

//middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/event', event)
app.use('/api/user', user)
app.use('/api/register', register)
app.use('/api/promotion', promotion)
app.use('/api/country', country)

const root = require('path').join(__dirname, 'public', 'build')
app.use(express.static(root));
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})
// app.get('*', function(req, res) {
//   res.sendFile(path.join(__dirname, "public", 'build', 'index.html'));
// });

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
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err.message);
  
});

module.exports = app;
