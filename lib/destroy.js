function destroy(id, options, callback) {
  'use strict';

  var _ = require('lodash/function');
  var _this = this;

  if (arguments.length < 3) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
  }

  if (id) {

    _this.findByIdAndRemove(id, function(err, doc) {
      if (err) {
        return callback(err);
      }

      _.defer(function() {
        return doc ? callback(null, {status: 204, message: 'Resource deleted.'}) : callback({
          status: 404,
          message: 'Resource not found.'
        });
      });

      // Remove relationships.
      if (options.relate && doc) {

        var relationships = require('./relationships')(_this);

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
                  callback(err);
                }
              }
            );
          });

        });
      }

    });

  } else {

    // Return 404 "Resource not found"
    return callback({status: 404, message: 'Resource not found.'});
  }
}

module.exports = destroy;
