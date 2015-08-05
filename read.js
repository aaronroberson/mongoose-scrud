module.exports = (function(Model, options) {
  'use strict';

  function read(id, queryParams, cb) {
    var populate = '';
    if (queryParams.__populate) {
      populate = queryParams.__populate;
      delete queryParams.__populate;
    }

    if (id) {
      // Lookup document
      Model.findById(id)
        .populate(populate)
        .exec(function(err, doc) {
          if (err) {
            return cb(err);
          }

          // Return doc or 404
          return doc ? cb(null, doc) : cb({status: 404, message: 'Resource not found'});
        });
    } else {

      // Return 404 "Resource not found"
      cb({status: 404, message: 'Resource not found'});
    }
  }

  return {
    read: read
  };

})(Model, options);