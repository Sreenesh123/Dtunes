const path = require("path");

module.exports = {
  mode: "development", 
  entry: "./src/main.jsx", 
  output: {
    path: path.resolve(__dirname, "dist"), 
    filename: "bundle.js", 
  },
  devServer: {
    static: path.join(__dirname, "dist"),
    port: 5173,
    hot: true, 
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, 
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, 
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
