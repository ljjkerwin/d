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



const entry = [
  // 'react',
  'doing',
  'demo',
];
exports.entry = entry;


const getConfig = () => {

  let config = {
    entry: entry.reduce((pre, cur) => {
      pre[cur] = path.resolve(entryPath, cur)
      return pre;
    }, {}),

    output: {
      path: outputPath,
      publicPath: `//localhost:9000/dist/`,
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
    ]
  }

  entry.forEach(e => {
    config.plugins.push(new HtmlWebpackPlugin({
      filename: `${e}.html`,
      chunks: [e],
    }))
  })
  
  return config
}


const getConfigDev = () => {
  let config = getConfig();

  config.mode = 'development';

  config.devServer = {
    contentBase: projectPath,
    port: 9000
  };

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
