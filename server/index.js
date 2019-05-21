const 
  fs = require('fs'),
  path = require('path'),
  express = require('express'),
  commander = require('commander'),
  ip = require('ip'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  // apiRouter = require('./apiRouter'),
  pageRouter = require('./pageRouter');



commander
  .option('-p, --port <9394>', 'servicePort')
  .option('-e, --env <dev>')
  .parse(process.argv);



const
  app = express(),
  servicePort = commander.port || 9394;


app
  .use((req, res, next) => {
    // console.log('[log][request]:', req.url);
    next()
  })
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: true }))



app
  // .use('/api', apiRouter())
  .use(pageRouter)

    

app
  .use(express.static('./', {
    maxAge: '0',
    setHeaders: (res, path, stat) => {
      res.set('Im', 'ljjkerwin');
      res.set('Access-Control-Allow-Origin', '*');
    },
  }))


app
  // not found
  .use((req, res, next) => {
    res.send('404');
  })
  // error
  .use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(500).send('Something wrong!');
  })


app.listen(servicePort, () => {
  console.log(`>>>>>>>>>>>>>>>>>> server is listening at ${ip.address()}:${servicePort}`);
})

