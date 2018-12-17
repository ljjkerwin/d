const 
  fs = require('fs'),
  path = require('path'),
  webpack = require('webpack'),
  ipAddress = require('./ipAddress'),
  AssetsWebpackPlugin = require('assets-webpack-plugin'),
  LiveReloadPlugin = require('webpack-livereload-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  HtmlAssetsOrderFixerWebpackPlugin = require('./html-assets-order-fixer-webpack-plugin');


const MiniCssExtractPlugin = require('mini-css-extract-plugin');


let projectPath = path.resolve(__dirname, '../'),
    entryPath = path.resolve(projectPath, './src/entry'),
    outputPath = path.resolve(projectPath, '.');


let entry = {};

[
  // 'react',
  'doing',
  // 'demo',
].forEach(e => {
  entry[e] = path.resolve(entryPath, e)
})


const getConfig = ({
  distName = 'dist',
  isProd = true,
} = {}) => {

  let config = {
    entry: Object.assign(entry),

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
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader?cacheDirectory',
            },
          ]
        },
        // {
        //   test: /\.tsx?$/,
        //   exclude: /(node_modules|bower_components)/,
        //   loader: 'awesome-typescript-loader'
        // },
        {
          test: /\.s?css$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              query: isProd ? 'minimize' : 'sourceMap',
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
            limit: 5,
            name: 'images/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 5,
            name: 'fonts/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(mp3)$/,
          loader: 'url-loader',
          options: {
            limit: 5,
            name: 'media/[name].[hash:8].[ext]'
          }
        },
        // {
        //   test: /\.hbs$/,
        //   loader: "handlebars-loader"
        // }
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash:8].css' : '[name].css',
        chunkFilename: "[id].css"
      }),
      new webpack.HashedModuleIdsPlugin()
    ],

    resolve: {
      modules: [path.resolve(__dirname, '../node_modules')], // 减少向上递归
      mainFields: ['jsnext:main','main'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'],
      // 自定依赖路径
      alias: {
        'lib': path.resolve(projectPath, './lib'),
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

  // HtmlWebpackPlugin
  let htmls = [];
  for (entry in config.entry) {
    if (/common|vendor/.test(entry)) continue;
    let entryName = entry.match(/[^\/]+$/)[0];
    
    htmls.push(new HtmlWebpackPlugin({
      filename: `${entryName}.html`,
      template: path.resolve(projectPath, 'webpack/template.html'),
      chunks: ({
        react: ['manifest', 'common', 'react-vendor', entry],
        doing: ['manifest', 'common', 'react-vendor', entry]
      })[entryName],
    }))
  }

  // config.plugins = config.plugins.concat(htmls)


  return config
}


const getConfigDev = () => {
  let config = getConfig({
    isProd: false
  });

  /**
   * cheap 不包含列信息，非模块源码
   * module 模块源码
   */
  config.devtool = 'cheap-module-source-map';

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
    }),
    new LiveReloadPlugin({
      appendScriptTag: true,
    }),
    // new HtmlAssetsOrderFixerWebpackPlugin(),
  ]);

  return config
}


const getConfigBuild = () => {
  let config = getConfig()

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ]);

  return config
}



exports.getConfigDev = getConfigDev
exports.getConfigBuild = getConfigBuild
