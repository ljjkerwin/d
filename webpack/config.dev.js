const 
  fs = require('fs'),
  path = require('path'),
  webpack = require('webpack'),
  ipAddress = require('./ipAddress'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  AssetsWebpackPlugin = require('assets-webpack-plugin'),
  LiveReloadPlugin = require('webpack-livereload-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin');


let projectPath = path.resolve(__dirname, '../'),
    entryPath = path.resolve(projectPath, './src/entry'),
    outputPath = path.resolve(projectPath, '.');


let entry = {};

[
  'react'
].forEach(e => {
  entry[e] = path.resolve(entryPath, e)
})


const getConfig = ({
  distName = 'dist',
  isProd = false,
} = {}) => {

  return {
    entry: Object.assign(entry, {
      'common': ['lib/zepto-custom'],
      'react-vendor': ['react', 'react-dom', 'redux'],
    }),

    output: {
      path: path.resolve(outputPath, distName),
      publicPath: `/${distName}/`,
      filename: isProd ?
        'js/[name].[chunkhash:8].js' :
        'js/[name].js'
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader?cacheDirectory',
            },
          ]
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'awesome-typescript-loader'
        },
        {
          test: /\.s?css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                query: isProd ? 'minimize' : 'sourceMap',
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: () => [
                    require('autoprefixer')({
                      browsers: ['> 5%', 'not ie <= 8', 'last 2 versions', 'Firefox ESR', 'iOS >= 8']
                    })
                  ]
                }
              },
              {
                loader: 'sass-loader',
              },
            ]
          })
        },
        {
          test: /\.s?css_$/,
          use: [
            {
              loader: 'style-loader',
            },

            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('autoprefixer')({
                    browsers: ['> 2%', 'not ie <= 8', 'last 2 versions', 'Firefox ESR', 'iOS >= 8']
                  })
                ]
              }
            },
            {
              loader: 'sass-loader',
            },
          ]
        },
        {
          test: /\.(jpg|png|ico|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10,
            name: 'images/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10,
            name: 'fonts/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.hbs$/,
          loader: "handlebars-loader"
        }
      ]
    },

    plugins: [
      new ExtractTextPlugin({
        filename: isProd ?
          'css/[name].[contenthash:8].css' :
          'css/[name].css',
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: ['common', 'react-vendor'],
      }),
    ],

    resolve: {
      modules: [path.resolve(__dirname, '../node_modules')], // 减少向上递归
      mainFields: ['jsnext:main','main'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'],
      // 自定依赖路径
      alias: {
        'modules': path.resolve(projectPath, './src/modules'),
        'lib': path.resolve(projectPath, './lib'),
      }
    },

    resolveLoader: {
      modules: [
        'node_modules',
        path.resolve(__dirname)
      ]
    },

    // externals: {
    //   'react': 'React',
    //   'react-dom': 'ReactDOM',
    // }

  }
};


const getConfigDev = () => {
  let config = getConfig({
    distName: 'dist'
  });

  /**
   * cheap 不包含列信息，非模块源码
   * module 模块源码
   */
  config.devtool = 'cheap-module-source-map';

  // let entry = config.entry;
  // for (let key in entry) {
  //   entry[key].push('webpack-hot-middleware/client?reload=true');
  //   entry[key].push('./webpack/webpackCssHotReload.js');
  // }
  // config.plugins.push(new webpack.HotModuleReplacementPlugin())

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
    }),
    new LiveReloadPlugin({
      appendScriptTag: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(projectPath, 'webpack/template.hbs')
    }),
  ]);

  return config;
}


module.exports = getConfigDev();



function getEntry(dir) {
  let entryObj = {},
    _paths = fs.readdirSync(dir);

  _paths.forEach(_path => {
    if (ignoreEntries.indexOf(_path) >= 0) return;

    let entry = path.resolve(dir, _path);

    if (fs.statSync(entry).isDirectory()) {
      let entryName = _path;

      entry = path.resolve(entry, 'index.js');
      if (fs.existsSync(entry)) {
        entryObj[_path] = [entry];
      } else if (entry += 'x', fs.existsSync(entry)) {
        entryObj[_path] = [entry];
      }

      return;
    }
  });

  // if (!fs.existsSync("./dist")) fs.mkdirSync('dist');
  // fs.writeFile('./dist/entry.json', JSON.stringify(entryObj), function(err) {
  //   if (err) throw err;
  // });

  return entryObj;
}
