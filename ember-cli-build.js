/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    compassOptions: {
      importPath: ['node_modules/animate.scss/vendor/assets/stylesheets','node_modules/normalize.scss', 'node_modules/font-awesome/scss']
    },
    fingerprint: {
      //will not be added hash
      exclude: ['images/emoji','kindeditor']
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('vendor/store.js');
  app.import('vendor/chart.js');
  return app.toTree();
};
