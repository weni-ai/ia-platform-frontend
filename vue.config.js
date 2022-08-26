
require('./config.env');

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import '~@weni/unnnic-system/dist/unnnic.css';
          @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
        `,
      },
    },
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader')
      .options({ /* ... */ });
  },
};
