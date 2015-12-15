function search(queryParams, cb) {
  'use strict';

  var _ = require('lodash');
  var query;
  var params = {};
  var fields = queryParams || {};
  var self = this;

  // Find geospatial index for geo queries.
  // http://docs.mongodb.org/manual/reference/operator/query/nearSphere/
  // https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes#geojson-support-mongodb--24
  var indexes = self.schema._indexes;
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

  // Normalize count parameter.
  if (_.has(fields, '__count')) {
    fields.__count = true;
  }

  _.each(['count', 'populate', 'sort', 'skip', 'limit', 'near', 'where', 'operator'], function(param) {

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
    var coordinates = params.near.split(',').map(function(item) {
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

      try {

        // Support JSON objects for range queries, etc.
        fields[field] = JSON.parse(value);

      } catch (e) {

        cb(e);
      }

      // Check if value is not an ObjectId
    } else if (!isNumber(value) && !isBoolean(value) && !/^[0-9a-fA-F]{24}$/.test(value)) {

      // Support Regex for LIKE queries
      fields[field] = {$regex: new RegExp(value, 'i')};
    }
  });

  if (params.operator) {

    // Check if value is an object
    if (/^{.*}$/.test(params.operator)) {

      try {

        // Support JSON objects for range queries, etc.
        params.operator = JSON.parse(params.operator);

      } catch (e) {

        cb(e);
      }
    }

    _.merge(fields, params.operator);

    delete params.operator;
  }

  query = self.find(fields);

  if (params.count) {
    query.count(fields)
      .exec()
      .then(function(count) {
        cb(null, [count]);
      }, function(error) {
        cb(error);
      });
  } else {
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
    if (params.where) {
      query.$where = _.bind(function(where) {
        for (var key in obj) {
          if (where && where === obj[key]) {
            return true;
          }
        }
      }, query, params.where);
    }
    query
      .exec()
      .then(function(items) {
        cb(null, {count: items.length, results: items});
      }, function(error) {
        cb(error);
      });
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function isBoolean(value) {
    return (value == 'true' || value == 'false' || value == 0 || value == 1);
  }
}

module.exports = search;
