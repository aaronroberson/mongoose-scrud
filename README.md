# Mongoose SCRUD

Simple plugin for [Mongoose](https://github.com/LearnBoost/mongoose) which adds SCRUD methods to your schema models. Also compatible with [AngularJS](http://angularjs.org) and ngResource.

## Installation

Install mongoose-scrud as a dependency and add it to your `package.json` file.

```
npm install mongoose-scrud --save
```

## Instructions

The mongoose-scrud plugin can be added individually to each schema or globally to all models.

### Global

```
// models.js
var mongoose = require('mongoose');

require('mongoose-scrud')(mongoose, {global: true});

// user.js
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
});

userSchema.plugin(scrud);

mongoose.model('User', userSchema);

```

_Note_ The plugin will not be applied to sub-documents. See [#1674](https://github.com/Automattic/mongoose/issues/1674).

### Individually

First, define your Mongoose models and any necessary validations, methods and indexes. Require the mongoose-scrud package and then register the plugin on your schema.

Example:

```
// user.js
var mongoose = require('mongoose');
var scrud = require('mongoose-scrud');

var userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
});

userSchema.plugin(scrud);

mongoose.model('User', userSchema);

```

Now your model will have `$search`, `$create`, `$read`, `$update`, and `$destroy` methods. You can use these methods however you would use any static method in Mongoose. However, they are especially helpful for use when performing CRUD operations, such with a RESTful API.

Example:

```
// router.js
server.get({path: '/accounts', version: '2.0.0', users.search);

// users.js
var mongoose = require('mongoose');
var User = mongoose.model('User');

// Function registered on RESTful endpoint
function search(req, res, done) {
  User.search(req.query, function(error, results) {
    error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
  });
}

exports.search = search;
```

_Note_ If you're using Express, you may be interested in [meanify](https://github.com/artzstudio/meanify) which can additionally generate routes for you. This package was inspired by meanify but created to work outside of the context of Express, such as Restify.

##scrud([schema, mongoose], [options])

The plugin for adding the SCRUD methods to each schema individually or to all modals globally.

Option     | Description
---------- | -------------
global     | `Boolean`. Apply to all models. Must provide `Mongoose` as first parameter. 

## Model.$search([options], callback)

The `$search` method returns an array of resources that match the fields and values provided in the options object. If no options are provided, the search will return up to 500 documents. An empty array (`[]`) will be returned if no documents are found.

Option     | Description
---------- | -------------
__limit    | `Numeric`. Limits the result set count to the supplied value. Default: `500`.
__skip     | `offset`. Number of records to skip. Cannot be used with `__distinct`.
__aggregate| `String`. Performs [aggregation](http://docs.mongodb.org/manual/applications/aggregation/) on the models collection.
__distinct | `String`. Finds the distinct values for a specified field across the current collection.
__sort     | `String`. Sorts the record according to provided [shorthand sort syntax](http://mongoosejs.com/docs/api.html#query_Query-sort) (e.g. `&__sort=-name`).
__populate | `String`. Populates object references with the full resource (e.g. `&__populate=users`).
__count    | `Numeric`. When present, returns the resulting count in an array (e.g. `[38]`).
__near     | `String`. Performs a geospatial query on given coordinates and an optional range (in meters), sorted by distance by default. Required format: `{longitude},{latitude},{range}`

#### REST Example

Options can be passed in as query parameters in the format of `&__{option}={value}` to unlock the power of MongoDB's `find()` API.

```
GET /api/users?id=544bbbceecd047be03d0e0f7&__limit=1


function search(req, res, done) {
	User.search(req.query, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```

Mongoose SCRUD also supports range queries. To perform a range query, pass in a stringified JSON object into the field on the request.

```
GET /api/posts?createdAt={"$gt":"2013-01-01T00:00:00.000Z"}
```

#### Angular example
Using `ngResource` in AngularJS, performing a range query is easy:

```
// Find posts created on or after 1/1/2013.
Posts.query({
	createdAt: JSON.stringify({
		$gte: new Date('2013-01-01')
	})
});
```

### Model.$create(doc, [options], callback)

The `$create` method saves a new document in the collection after it has been validated. This method returns the new document, or a Mongoose error.

Option   | Description
-------- | -------------
strict   | `Boolean/String`. Ensures that property values not specified in the schema do not get saved to the db. Values: `true` (default), `false`, 'throw'.
relate   | `Boolean`. Automatically populates references (Experimental). Default: `false`.

Example: 

```
function create(req, res, done) {
	Model.$create(req.body, , function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```

### Model.$read(id, [options], callback)

The `$read` method returns a single resource object in the collection that matches a given id. If a matching document can't be found, returns an object with a 404 status and the message 'Resource not found' `{status: 404, message: 'Resource not found.'}`.

Example: 

```
function(req, res, next) {
	User.read(id, req.query, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```

Option     | Description
---------- | -------------
__populate | `String`. Populates object references with the full resource (e.g. `&__populate=users`).

### Model.$update(id, doc, callback)

The `$update` method updates a single resource object in the collection that matches a given id. Returns the updated document. If a matching document can't found, returns an object with a 404 status and the message 'Resource not found' `{status: 404, message: 'Resource not found.'}`.

Example: 

```
function(req, res, next) {
	User.read(id, req.query, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```

### Model.$destroy(id, [options], callback)

The `$destroy` method will delete a document from the collection and return an object with a status of 204 and the message 'Resource deleted' `{status: 204, message: 'Resource deleted'}`. If the delete failed an object will be returned with a stats of 404 and the message 'Resource not found' `{status: 404, message: 'Resource not found.'}`.

Example: 

```
function(req, res, next) {
	User.del(id, {relate: true}, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```

Option   | Description
-------- | -------------
relate   | `Boolean`. Automatically delete references (Experimental). Default: `false`.

## Sub-documents
```
function index(req, res) {
  req.query = req.query || {};

  // Support for nested resources such as
  // GET /portal/accounts/:id/transactions
  if (request.params.id || request.accountId) {
    req.query.account = req.params.id || req.accountId;
  }

  // Default sort to descending order on createdAt
  req.query.__sort = req.query.__sort || '-createdAt';

  User.search(req.query, function(error, results) {
    error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
  });
}
```

## Validation Hooks

Mongoose SCRUD will handle [validation described by your models](http://mongoosejs.com/docs/validation.html), as well as any [error handling defined](http://mongoosejs.com/docs/middleware.html) in your `pre` middleware hooks.

```
postSchema.path('type').validate(function (value) {
  return /article|review/i.test(value);
}, 'InvalidType');

```

The above custom validator example will return a validation error if a value other than "article" or "review" exists in the `type` field upon creation or update.

Example response:

```
{
	message: 'Validation failed',
	name: 'ValidationError',
	errors: {
		type:
			{
				message: 'InvalidType',
				name: 'ValidatorError',
				path: 'type',
				type: 'user defined',
				value: 'poop'
			}
		}
	}
}
```

Advanced validation for the `$create` and `$update` methods may be achieved using the `pre` hook, for example:

```
commentSchema.pre('save', function (next) {
	if (this.message.length <= 5) {
		var error = new Error();
		error.name = 'ValidateLength'
		error.message = 'Comments must be longer than 5 characters.';
		return next(error);
	}
	next();
});
```

Mongoose SCRUD will return an error object upon failure.

```
{
	name: 'ValidateLength',
	message: 'Comments must be longer than 5 characters.'
}
```

## Roadmap

* Add unit tests
* Adding the `__where` option to search.
* Solidifying the relate feature.
* Updating package to use reactive programming
* Converting source code to ES2015

_PRs encouraged!_

## Changelog

### 0.2.8 | 1/13/2016

FIX: fix global feature

### 0.2.7 | 10/22/2015

FIX: update global option and method invocation.

### 0.2.6 | 10/18/2015

FEATURE: Add `global` option for globally adding methods to all schemas.

### 0.2.5 | 10/18/2015

BREAKING CHANGE: $update method signature has changed. First parameter is now an ID instead of an object.

### 0.2.4 | 10/17/2015

FEATURE: Add support for aggregation when using the `$search` method via the `__aggregate` option.
FEATURE: Add support for distinct values for a specified field when using $search` via the `__distinct` option.
BREAKING CHANGE: Changed the method names and signatures of the SCRUD methods.

Previous | New
-------- | -------------
search   | $search
create   | $create
read     | $read
del      | $destroy

### 0.2.3 | 10/17/2015

FIX: Coerce limit to number in search

### 0.2.2 | 10/15/2015

FIX: `this` management.

### 0.2.1 | 10/15/2015

FIX: fix model references in search.

### 0.2.0 | 10/11/2014
* Beta release:
FEATURE: Add Regex support to `$search()` method for `LIKE` queries
BREAKING CHANGE: Updated as a Mongoose plugin.

The old way of using this module was:

```
var scrud = require('mongoose-scrud')(Model, {
    relate: true
});

scrud.search();

```

The new way of using this module is to register it as a plugin:
```
var scrud = require('mongoose-scrud');
userSchema.plugin(scrud);
User.search();
```

### 0.1.0 | 10/28/2014
* Alpha release ready for publish to npm and testing.

## License 

(The MIT License)

Copyright (c) 2015 Aaron Roberson &lt;aaronaroberson@gmail.com&gt;

Based on [meanify](https://github.com/artzstudio/meanify).

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
