"use strict";

require("@babel/polyfill");
require("@babel/register")({
  plugins: [
    "@babel/plugin-proposal-async-generator-functions",
    "@babel/plugin-transform-modules-commonjs"
  ]
});
