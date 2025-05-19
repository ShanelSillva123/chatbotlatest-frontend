const path = require("path");

module.exports = {
  entry: "./src/widget-entry.js", // <- use the wrapper file here
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "chatbot-widget.js",
    library: "ChatbotWidget",
    libraryTarget: "umd",
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|json)$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
