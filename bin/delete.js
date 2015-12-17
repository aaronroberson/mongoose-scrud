function del(id, options, cb) {
  'use strict';

  var _ = require('lodash');
  var self = this;

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
  }

  if (id) {

    self.findByIdAndRemove(id, function(err, doc) {
      if (err) {
        return cb(err);
      }

      _.defer(function() {
        // Return 204 "No Content" or 404 "Resource not found
        return doc ? cb(null, {status: 204, message: 'Resource deleted'}) : cb({
          status: 404,
          message: 'Resource not found'
        });
      });

      // Remove relationships.
      if (options.relate && doc) {

        var relationships = require('relationships.js')(self);

        // TODO: Finish deleting relationships before sending response.
        relationships.forEach(function(relation) {

          var referenceId = doc[relation.property];

          // Normalize to array.
          if (!Array.isArray(referenceId)) {
            referenceId = [referenceId];
          }

          referenceId.forEach(function(id) {
            var update = {};
            update[relation.relatedProperty] = doc._id;
            relation.relatedModel.findByIdAndUpdate(id,
              relation.isArray ? {$pull: update} : {$unset: update},
              function(err, data) {
                if (err) {
                  cb(err);
                }
              }
            );
          });

        });
      }

    });

  } else {

    // Return 404 "Resource not found"
    return cb({status: 404, message: 'Resource not found'});
  }
}

module.exports = del;
