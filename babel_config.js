export default {
  babelrc: false,
  presets: [
    ["@babel/preset-env", {
      // Cf. https://github.com/rollup/rollup-plugin-babel#modules
      modules: false,
      targets: {
        browsers: [
          ">1%",
          "last 4 versions",
          "Firefox ESR",
          "not ie < 9"
        ]
      }
    }]
  ]
};
