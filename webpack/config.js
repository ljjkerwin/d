const 
  fs = require('fs'),
  path = require('path'),
  webpack = require('webpack'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

const
  projectPath = path.resolve(__dirname, '../'),
  entryPath = path.resolve(projectPath, './src/entry'),
  outputPath = path.resolve(projectPath, './dist');



let entry = [
  // 'react',
  'doing',
  // 'demo',
]


const getConfig = () => {

  let config = {
    entry: entry.reduce((pre, cur) => {
      pre[cur] = path.resolve(entryPath, cur)
      return pre;
    }, {}),

    output: {
      path: outputPath,
      publicPath: `/dist/`,
      filename: 'js/[name].js'
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === 'development',
              },
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('autoprefixer')({
                    browsers: ['> 2%', 'not ie <= 10', 'last 2 versions', 'Firefox ESR', 'iOS >= 9']
                  })
                ]
              }
            },
            'sass-loader',
          ],
        },
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
      new HtmlWebpackPlugin(),
    ]
  }

  return config
}


const getConfigDev = () => {
  let config = getConfig();

  config.mode = 'development';

  return config;
}


const getConfigBuild = () => {
  let config = getConfig()

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ]);

  return config;
}



exports.getConfigDev = getConfigDev
exports.getConfigBuild = getConfigBuild
