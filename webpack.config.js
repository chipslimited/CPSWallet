var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/dist/",
    filename: "build.js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {}
          },
          {
            loader: "iview-loader",
            options: {
              prefix: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "less-loader",
            options: { strictMath: true, noIeCompat: true }
          }
        ]
      },
      { 
        test: /\.css$/, 
        use: {
          loader: "css-loader", options: { importLoaders: 1 }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: "url-loader"
      }
    ]
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js"
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  //devtool: "#eval-source-map"
};

if (process.env.NODE_ENV === "production") {
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

  module.exports.devtool = "#source-map";
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
      new UglifyJsPlugin({
          sourceMap: false,
          uglifyOptions: {
              ecma:8,
              sourceMap: false,
              compress: {
                  sequences: true,
                  dead_code: true,
                  conditionals: true,
                  collapse_vars: true,
                  reduce_vars: true,
                  booleans: true,
                  evaluate: true,
                  unused: true,
                  unsafe: true,
                  if_return: true,
                  join_vars: true,
                  drop_console: true,
                  drop_debugger: true,
                  properties: true,
                  comparisons: false,
                  loops: true,
                  hoist_funs: true,
                  warnings: false,
              },
              output: {
                  comments: function(node, comment) {
                      return false;
                  }
              }
          }
      }),
  ]);
}
