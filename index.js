/*!
 * Mongoose SCRUD Plugin
 * Copyright(c) 2015 Aaron Roberson <aaronroberson@gmail.com>
 * MIT Licensed
 */
var _ = require('lodash/object');
var search = require('./lib/search');
var create = require('./lib/create');
var read = require('./lib/read');
var update = require('./lib/update');
var destroy = require('./lib/destroy');

function scrud(schema, options) {

  if (_.get(options, 'global')) {

    mongoose = schema;

    // Add the static methods to every schema
    scrud.bind(mongoose.plugin);

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
