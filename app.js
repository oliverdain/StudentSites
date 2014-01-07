var express = require('express');
var swig = require('swig');
var http = require('http');
var fs = require('fs');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(express.logger('dev'));
app.use(express.bodyParser());

var STUDENT_ROOTS = __dirname + '/www';
var subApps = {};

// Construct a complete express app for each student with swig and static routes
// set correctly, cache it, and return it.
var getSubApp = function(student) {
  if (subApps.hasOwnProperty(student)) {
    console.log('Returning cached app for %s', student);
    return subApps[student];
  } else {
    console.log('Constructing a new app object for %s', student);
    var subApp = express();
    subApp.use(express.logger('dev'));
    subApp.use(express.bodyParser());

    swig.setDefaults({ cache: false });

    subApp.use(express.errorHandler());

    var HTML_REGEX = /\.html$/;

    subApp.all('*', function(req, res, next) {
      var reqPath;
      if (req.path === '/') {
        console.log('path is / changing to index.html');
        reqPath = '/index.html';
      } else {
        reqPath = req.path;
      }

      if (HTML_REGEX.test(reqPath)) {
        var fullPath = STUDENT_ROOTS + '/' + student +  reqPath;
        fs.exists(fullPath, function(exists) {
          if (exists) {
            console.log('%s exists, calling render', fullPath);
            swig.renderFile(fullPath, {}, function(err, output) {
              if (err) {
                res.send('Error rendering template: ' + err);
              } else {
                res.send(output);
              }
            });
          } else {
            console.log('No such file %s', fullPath);
            next();
          }
        });
      } else {
        console.log('%s is not an html file, calling next', reqPath);
        next();
      }
    });

    subApp.use(express.static(STUDENT_ROOTS + '/' + student));

    subApps[student] = subApp;
    return subApp;
  }
};

app.all('/*', function(req, res, next) {
  var sub = req.subdomains;
  if (sub.length <= 1) {
    next(new Error('No subdomain: ' + req.host));
  } else if (sub.length > 2) {
    next(new Error('Too many subdomains: ' + req.host));
  } else {
    var student = sub.pop();
    var sApp = getSubApp(student);
    sApp(req, res);
  }
});

app.use(express.errorHandler());

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

