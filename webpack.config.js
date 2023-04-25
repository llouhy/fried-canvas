const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
  entry: './src/index.ts', // 入口
  output: {
    filename: 'engine.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'dogdog',
    libraryTarget: 'umd', // 导出模块为umd
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: 4,
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
    ]
  },
  optimization: {
    splitChunks: {
      // include all types of chunks
      minSize: 20000,
      chunks: 'all',
      // 重复打包问题
      cacheGroups:{
        vendors:{ // node_modules里的代码
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          // name: 'vendors', 一定不要定义固定的name
          priority: 10, // 优先级
          enforce: true 
        }
      }
    }
  }
}
