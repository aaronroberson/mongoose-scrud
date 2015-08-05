module.exports = (function(Model, options) {
  'use strict';

  var _ = require('lodash');

  // Find geospatial index for geo queries.
  // http://docs.mongodb.org/manual/reference/operator/query/nearSphere/
  // https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes#geojson-support-mongodb--24
  var indexes = Model.schema._indexes;
  var geoField;
  if (indexes) {
    indexes.forEach(function(indexes) {
      indexes.forEach(function(index) {
        for (var x in index) {
          if (index[x] === '2dsphere') {
            geoField = x;
            break;
          }
        }
      });
    });
  }

  function search(queryParams, cb) {
    var query;
    var params = {};
    var fields = queryParams || {};

    // Normalize count parameter.
    if (fields.hasOwnProperty('__count')) {
      fields.__count = true;
    }

    _.each(['count', 'populate', 'sort', 'skip', 'limit', 'near', 'where'], function(param) {

      // Assign special query strings to params
      params[param] = fields['__' + param];

      // Remove special query string from fields
      delete fields['__' + param];
    });

    // Support for GEOJSON
    if (params.near) {

      // Require geoField
      if (!geoField) {
        return next({
          error: 'Geospatial Index Not Found',
          message: 'http://docs.mongodb.org/manual/reference/operator/query/nearSphere/ --> ' +
          'The $nearSphere operator requires a geospatial index and can use either 2dsphere ' +
          'index or 2d index for location data defined as GeoJSON points or legacy coordinate ' +
          'pairs. To use a 2d index on GeoJSON points, create the index on the coordinates ' +
          'field of the GeoJSON object. To set index in Mongoose: ' +
          '// https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes#geojson-support-mongodb--24'
        });
      }

      // Sanitize coordinates
      var coordinates = params.near.split(',').map(function (item) {
        return parseFloat(item);
      });

      // Search point geometry by coordinates
      fields[geoField] = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          }
        }
      };

      // Set max distance (meters) if supplied.
      if (coordinates.length === 3) {
        fields[geoField].$nearSphere.$maxDistance = coordinates.pop();
      }
    }

    _.each(fields, function(value, field) {

      // Check if value is an object
      if (/^{.*}$/.test(value)) {

        // Support JSON objects for range queries, etc.
        fields[field] = JSON.parse(value);

        // Check if value is not an ObjectId
      } else if (!/^[0-9a-fA-F]{24}$/.test(value)) {

        // Support Regex for LIKE queries
        fields[field] = {$regex: new RegExp(value, 'i')};
      }
    });

    // Support for searching all fields in a collection
    if (params.where) {
      fields.$where = function() {
        for (var key in this) {
          if (this[key] === params.where) {
            return true;
          }
          return false;
        }
      };
    }

    query = Model.find(fields);

    if (params.count) {

      // Return count
      query.count(fields)
        .exec()
        .then(function(count) {
          return cb(null, [count]);
        }, function(error) {
          return cb(error);
        });

    } else {

      // Build query
      if (params.limit) {
        query.limit(params.limit);
      }
      if (params.skip) {
        query.skip(params.skip);
      }
      if (params.sort) {
        query.sort(params.sort);
      }
      if (params.populate) {
        query.populate(params.populate);
      }

      // Execute query
      query
        .exec()
        .then(function(docs) {

          // Return query results
          return cb(null, {count: docs.length, results: docs});

        }, function(error) {

          // Return error
          return cb(error);
        });
    }
  }

  return {
    search: search
  }

})(Model, options);