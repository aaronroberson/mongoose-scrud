module.exports = (function(Model, options) {
  'use strict';

  var mongoose = require('mongoose');

  if (typeof Model === 'string') {
    Model = mongoose.model(Model);
  }

  return {
    search: require('./search').call(Model, options),
    create: require('./create').call(Model, options),
    read: require('./read').call(Model, options),
    update: require('./update').call(Model, options),
    del: require('./delete').call(Model, options)
  }

})(Model, options);