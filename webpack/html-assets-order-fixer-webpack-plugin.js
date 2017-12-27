class HtmlAssetsOrderFixerWebpackPlugin {
    apply(compiler) {
      compiler.plugin('compilation', function(compilation) {
     
        compilation.plugin('html-webpack-plugin-alter-asset-tags', function(htmlPluginData, callback) {
          
          // 记录原顺序，再根据配置顺序调换
          let bodyAssets = htmlPluginData.body,
              optionsChunks = htmlPluginData.plugin.options.chunks,
              preChunkOrder = [],
              preChunkMap = {};

          optionsChunks.forEach(chunk => {
            for (let i in bodyAssets) {
              if ((new RegExp(`[^-_]${chunk}[^-_]`)).test(bodyAssets[i].attributes.src)) {
                preChunkOrder.push(i);
                preChunkMap[chunk] = bodyAssets[i];
                return;
              }
            }
          })
  
          preChunkOrder.sort((l, r) => l - r)
  
          optionsChunks.forEach(chunk => {
            if (preChunkMap[chunk]) {
              bodyAssets[preChunkOrder[0]] = preChunkMap[chunk];
              preChunkOrder.shift();
            }
          })
  
          callback(null, htmlPluginData);
        });
      });
    }
  }
  

  module.exports = HtmlAssetsOrderFixerWebpackPlugin;