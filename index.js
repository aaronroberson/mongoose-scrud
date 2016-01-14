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

function scrud(obj, options) {

  if (_.get(options, 'global') && _.has(obj, 'plugin')) {

    // Add the static methods to every schema
    obj.plugin(scrud);

  } else {

    // Add the methods to an individual schema
    obj.statics.$search = search;
    obj.statics.$create = create;
    obj.statics.$read = read;
    obj.statics.$update = update;
    obj.statics.$destroy = destroy;
  }
}

module.exports = scrud;
