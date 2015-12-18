function read(id, options, callback) {
  'use strict';

  var populate = '';
  var _this = this;

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
  }

  if (options.__populate) {
    populate = options.__populate;
    delete options.__populate;
  }

  if (id) {
    // Lookup document
    _this.findById(id)
      .populate(populate)
      .exec(function(err, doc) {
        if (err) {
          return callback(err);
        }

        // Return doc or 404
        return doc ? callback(null, doc) : callback({status: 404, message: 'Resource not found.'});
      });
  } else {

    // Return 404 "Resource not found"
    callback({status: 404, message: 'Resource not found.'});
  }
}

module.exports = read;
