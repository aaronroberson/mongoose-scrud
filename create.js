module.exports = (function(Model, options) {
  'use strict';

  function create(payload, cb) {

    this.create(payload, function(err, doc) {
      if (err) {
        return cb(err)
      }

      // Populate relationships.
      if (options.relate) {
        var relationships = require('relationships')(Model);

        // TODO: Finish relationships before sending response.
        relationships.forEach(function(relation) {

          var referenceId = doc[relation.property];
          // Normalize to array.
          if (!Array.isArray(referenceId)) {
            referenceId = [ referenceId ];
          }

          referenceId.forEach(function(id) {
            var update = {};
            update[relation.relatedProperty] = doc._id;
            relation.relatedModel.findByIdAndUpdate(id,
              relation.isArray ? { $addToSet: update } : update,
              function(err, data) {
                if (err) {
                  return cb(err);
                }
              }
            );
          });

        });
      }

      // Return document
      return cb(null, doc)
    });
  }

  return {
    create: create
  }

})(Model, options);
