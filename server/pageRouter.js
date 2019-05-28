const
  path = require('path'),
  fs = require('fs'),
  router = require('express').Router(),
  Handlebars = require('handlebars'),
  proxy = require('http-proxy-middleware'),
  webpackEntry = require('../webpack/config').entry;



webpackEntry.forEach(entry => {
  router.use(`/${entry}`, proxy({
    target: `http://localhost:${9000}/`,
    pathRewrite: {'.*' : `/dist/${entry}.html`}
  }))
})



module.exports = router;


// const getTemplate = (function () {
//   const cache = {};

//   return path => {
//     // if (cache[path]) return cache[path];

//     let template = fs.readFileSync(path, 'utf8');
//     template = Handlebars.compile(template);
//     cache[path] = template;

//     return template
//   }
// })()

