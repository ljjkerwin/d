const fs = require('fs');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require("webpack-hot-middleware");
const ipAddress = require('./ipAddress');

const app = express();
const config = require('./config.js').getConfigDev();


app.set('views', './webpack');
app.set('view engine', 'jade');


app.use(function(req, res, next) {
  console.log('log [request]:', req.url);
  if (req.query.m && req.query.m.indexOf('a') >= 0) {

    return proxy('www.baidu.com', {
      forwardPath: function(req, res) {
        return require('url').parse(req.url).path;
      }
    })(req, res, next);
  }
  next();
});



const compiler = webpack(config);

app
  .use(webpackDevMiddleware(compiler, {
    // contentBase: path.resolve(__dirname, '../dist'),   //服务器根目录

    // config的output路径的逻辑位置，不能改，改了报错
    // https://github.com/webpack/webpack-dev-middleware/issues/68
    publicPath: '/dist_dev/',

    stats: {
        colors: true,
        progress: true,
    },
  }))
  .use(webpackHotMiddleware(compiler))
  .use(express.static('./'));


// 代理
app.all('/timeout*', function (req, res, next) {
  let time = req.query.time || 30000;
  setTimeout(function () {
    res.append('Content-Type', 'application/json');
    res.send({aaa:123});
  }, time);
});

app.all('/request', function (req, res, next) {
  res.append('test', 1);
  res.append('expires', new Date(Date.now() + 10000));
  res.send({res: true});

});


// 代理
app.all(/\/api\//, proxy('qwe.com', {
  forwardPath: function(req, res) {
    return require('url').parse(req.url).path;
  }
}));


app.get('/:page', function(req, res, next) {
  var page = req.params.page;
  console.log('page:', page)
  if (!config.entry[page]) return next();
  res.render('template', {
    title: page,
    page: page
  })
});


// 404处理
app.use(function(req, res, next) {
  res.status(404).send('404, page can not find!!!!!!!!!!!!');
});

// 错误处理
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('somethings is wrong!');
});


var port = 9394;
var server = app.listen(port, function() {
  console.log('------------ server is listening at ' + ipAddress + ':' + server.address().port);
});



/**
 * function
 */
function parseJsonFile(filePath) {
  try {
    var assets = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(assets);
  } catch (e) {
    console.error(e);
    return false;
  }
}
