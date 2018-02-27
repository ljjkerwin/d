const 
  express = require('express'),
  multer = require('multer'),
  upload = multer({ dest: 'uploads/' });


const routes = [
  ['post', '/upload', (req, res) => {
    upload.single('fff')(req, res, err => {
      if (err) {
        console.log(err)
      }
      console.log(req.body,req.file, req.files)
      res.send('123')
    })
  }],
]


const apiRouter = function () {
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


module.exports = apiRouter