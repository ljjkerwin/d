const
  path = require('path'),
  fs = require('fs'),
  express = require('express'),
  Handlebars = require('handlebars');


const getTemplate = (function () {
  const cache = {};

  return path => {
    if (cache[path]) return cache[path];

    let template = fs.readFileSync(path, 'utf8');
    console.log(template)
    template = Handlebars.compile(template);
    cache[path] = template;

    return template
  }
})()


const routes = [
  ['get', '/react', function (req, res, next) {
    let initState = {
      userInfo: {
        name: 'kerwin'
      }
    }

    let result = getTemplate('dist/react.html')({
      title: 'react',
      initState: `<script>window.__initState = ${JSON.stringify(initState)}</script>`
    })

    res.send(result)
  }],

  ['get', '/doing', function (req, res, next) {
    res.send(getTemplate('dist/doing.html')({
      title: 'doing'
    }))
  }],
]


const pageRouter = function () {
  const router = express.Router();

  routes.forEach(route => {
    let method = route[0],
        path = route[1],
        middlewares = route.slice(2);

    if (router[method]) {
      router[method](path, middlewares)
    }
  })

  return router;
}


module.exports = pageRouter
