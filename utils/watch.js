var webpack = require("webpack"),
    config = require("../webpack.config");

delete config.chromeExtensionBoilerplate;

webpack(
  {...config,
  watch: true},
  function (err) { if (err) throw err; }
);
