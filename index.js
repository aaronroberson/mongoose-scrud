/*!
 * Mongoose SCRUD Plugin
 * Copyright(c) 2015 Aaron Roberson <aaronroberson@gmail.com>
 * MIT Licensed
 */

var search = require('./bin/search');
var create = require('./bin/create');
var read = require('./bin/read');
var update = require('./bin/update');
var del = require('./bin/delete');

function scrud(schema) {
  schema.statics.search = search;
  schema.statics.create = create;
  schema.statics.read = read;
  schema.statics.update = update;
  schema.statics.del = del;
}

module.exports = scrud;
