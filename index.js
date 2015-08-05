module.exports = function(Model, options) {
  'use strict';

  var mongoose = require('mongoose');

  if (typeof Model === 'string') {
    Model = mongoose.model(Model);
  }

  return {
    search: require('./search')(Model, options),
    create: require('./create')(Model, options),
    read: require('./read')(Model, options),
    update: require('./update')(Model, options),
    del: require('./delete')(Model, options)
  };
};