const
  path = require('path'),
  fs = require('fs'),
  express = require('express'),
  Handlebars = require('handlebars');


const getTemplate = (function () {
  const cache = {};

  return path => {
    // if (cache[path]) return cache[path];

    let template = fs.readFileSync(path, 'utf8');
    template = Handlebars.compile(template);
    cache[path] = template;

    return template
  }
})()


const routes = [
  ['get', '/doing', function (req, res, next) {
    res.send(getTemplate(`dist/index.html`)({
      title: 'doing'
    }))
  }],
  ['get', '/react', function (req, res, next) {
    let initState = {
      userInfo: {
        name: 'kerwin'
      }
    }

    let result = getTemplate(`dist/react.html`)({
      title: 'react',
      initState: `<script>window.__initState = ${JSON.stringify(initState)}</script>`
    })

    res.send(result)
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
