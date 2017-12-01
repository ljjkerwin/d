const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ipAddress = require('./ipAddress');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsWebpackPlugin = require('assets-webpack-plugin');


let projectPath = path.resolve(__dirname, '../'),
    entryPath = path.resolve(projectPath, './src/entry'),
    outputPath = path.resolve(projectPath, '.');

let ignoreEntries = [
  'chat', 
  'lfm',
  // 'react',
];


const getConfig = (options = {}) => {
  let { isBuild, distName, minimize } = options;

  return {
    entry: Object.assign(getEntry(entryPath), {
    }),

    output: {
      path: path.resolve(outputPath, distName),
      publicPath: `/${distName}/`,
      filename: isBuild ?
        // 'js/[name].[chunkhash:8].js' :
        'js/[name].js' :
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
                query: minimize ? 'minimize' : 'sourceMap',
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
        }
      ]
    },

    plugins: [
      new ExtractTextPlugin({
        filename: isBuild ?
          'css/[name].[contenthash:8].css' :
          'css/[name].css',
      }),
    ],

    resolve: {
      modules: [path.resolve(__dirname, '../node_modules')], // 减少向上递归
      mainFields: ['jsnext:main','main'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'],
      // 自定依赖路径
      alias: {
        'modules': path.resolve(projectPath, './src/modules'),
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


exports.getConfigDev = () => {
  let config = getConfig({
    distName: 'dist_dev'
  });

  let entry = config.entry;
  for (let key in entry) {
    entry[key].unshift('webpack-hot-middleware/client?reload=true');
    entry[key].push('./webpack/webpackCssHotReload.js');
  }

  Object.assign(config, {
    /**
     * cheap 不包含列信息，非模块源码
     * module 模块源码
     */
    devtool: 'cheap-module-source-map',
  });

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]);

  return config;
}


exports.getConfigBuild = () => {
  let distName = 'dist';

  let config = getConfig({
    isBuild: true,
    distName,
    minimize: true,
  });

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new removeDistDirectory(),
    new (require('uglifyjs-webpack-plugin'))(),
    new AssetsWebpackPlugin({
      filename: 'dist/assets-map.json',
      prettyPrint: true,
      metadata: {
        version: Date.now()
      },
      processOutput(assets) {
        return assets;
      }
    }),
    // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin(),
    new (require('html-webpack-plugin'))({
      filename: 'html/index.html',
      template: 'webpack/template.html',
    }),
  ]);


  return config;
}





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



class removeDistDirectory {
  apply(compiler) {
    compiler.plugin("emit", (compilation, callback) => {
      removeDirectory(compiler.outputPath);
      callback();
    });
  }
}


function removeDirectory(path) {
  if (fs.existsSync(path)) {
    let files = fs.readdirSync(path);
    files.forEach(file => {
      let subPath = path + '/' + file;
      if (fs.statSync(subPath).isDirectory()) {
        removeDirectory(subPath);
      } else {
        fs.unlinkSync(subPath);
      }
    });
    fs.rmdirSync(path);
  }
}


class timePlugin {
  apply(compiler) {
    compiler.plugin("compile", function(params) {
      console.log("The compiler is starting to compile...");
    });

    compiler.plugin("compilation", function(compilation) {
      console.log("The compiler is starting a new compilation...");

      compilation.plugin("optimize", function() {
        console.log("The compilation is starting to optimize files...");
      });
    });

    compiler.plugin("emit", function(compilation, callback) {
      console.log("The compilation is going to emit files...");
      callback();
    });
  }
}



class assetsPlugin {
  apply(compiler) {
    compiler.plugin("emit", (compilation, callback) => {
      compilation.chunks.forEach(function (chunk) {



        chunk.modules.forEach(function (module, index) {

          // index || console.log(Object.keys(module))

          module.fileDependencies && module.fileDependencies.forEach(function (filepath) {
            console.log(filepath)
          });
        });

        chunk.files.forEach(function (filename) {

          // console.log(filename)
          var source = compilation.assets[filename].source();
        });
      });

      callback();
    });
  }
}


class watchPlugin {
  constructor() {
    this.chunkVersions = {};
  }
  apply(compiler) {

    compiler.plugin('emit', function (compilation, callback) {

      var changedChunks = compilation.chunks.filter(function (chunk) {
        var oldVersion = this.chunkVersions[chunk.name];
        this.chunkVersions[chunk.name] = chunk.hash;
        return chunk.hash !== oldVersion;
      }.bind(this));

      changedChunks.forEach(item => console.log(item.name))

      callback();
    }.bind(this));
  }
}