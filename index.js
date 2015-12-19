/*!
 * Mongoose SCRUD Plugin
 * Copyright(c) 2015 Aaron Roberson <aaronroberson@gmail.com>
 * MIT Licensed
 */
var _ = require('lodash');
var search = require('./lib/search');
var create = require('./lib/create');
var read = require('./lib/read');
var update = require('./lib/update');
var destroy = require('./lib/destroy');

function scrud(schema, options) {

  if (_.get(options, 'applyAll')) {

    // Add the static methods to every schema
    mongoose.plugin(scrud);

  } else {

    // Add the methods to an individual schema
    schema.statics.$search = search;
    schema.statics.$create = create;
    schema.statics.$read = read;
    schema.statics.$update = update;
    schema.statics.$destroy = destroy;
  }
}

module.exports = scrud;
