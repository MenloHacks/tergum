var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
import { graphqlExpress } from 'graphql-server-express';
import { graphiqlExpress } from 'graphql-server-express';
var password = require('password-hash-and-salt');
import  schema  from './graphql/schema';
var mongooseadmin = require('mongooseadmin');
var mongoose = require("mongoose");
var async = require('async');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema, graphiql: true}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  schema: schema
}));

var admin_options = {
  // mongoose.models[key].schema.paths
  authentication:
      function (username, pass, callback) {
        callback(pass == process.env.TERGUM_ADMIN_PASSWORD);
      }
};

app.use('/admin',mongooseadmin(admin_options));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
