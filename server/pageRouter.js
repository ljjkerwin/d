const
  path = require('path'),
  express = require('express');


const routes = [
  ['get', '/react', function (req, res, next) {
    res.sendFile(path.resolve('dist/react.html'))
  }],
  ['get', '/doing', function (req, res, next) {
    res.sendFile(path.resolve('dist/doing.html'))
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
