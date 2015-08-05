module.exports = (function(Model, options) {
  'use strict';

  var _ = require('lodash');

  function del(id, cb) {
    if (id) {
      this.findByIdAndRemove(id, function(err, doc) {
        if (err) {
          return cb(err);
        }

        // Remove relationships.
        if (options.relate && doc) {
          var relationships = require('relationships')(Model);

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

        // Return 204 "No Content" or 404 "Resource not found
        return doc ? cb(null, {status: 204, message: 'Resource deleted'}) : cb({
          status: 404,
          message: 'Resource not found'
        });

      });

    } else {

      // Return 404 "Resource not found"
      return cb({status: 404, message: 'Resource not found'});
    }
  }

  return {
    del: del
  };

})(Model, options);