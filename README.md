# Mongoose SCRUD

Simple plugin for [Mongoose](https://github.com/LearnBoost/mongoose) which adds SCRUD methods to your schema models. Also compatible with AngularJS and ngResource.

## Installation

Install mongoose-scrud as a dependency and add it to your `package.json` file.

```
npm install mongoose-scrud --save
```

## Usage

Before you begin, be sure [MongoDB is installed](http://docs.mongodb.org/manual/installation/) and `mongod` is running.

First, define your Mongoose models and any necessary validations and indexes.

```
// models.js
var scrud = require('mongoose-scrud');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
});

```

Then register the plugin on your schema:

```
userSchema.plugin(scrud);

```

Now your model will have `search`, `create`, `read`, `update`, and `del` methods:

```
var User = mongoose.model('User');

User.search(req.query, function(error, results) {
  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
});
```

## Usage

For each model, five endpoints are created that handle resource search, create, read, update and delete (SCRUD) functions.

### Search
```
function(req, res, next) {
	User.search(req.query, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
The search route returns an array of resources that match the fields and values provided in the query parameters.

For example:

```
GET /api/posts?author=544bbbceecd047be03d0e0f7&__limit=1
```
If no query parameters are present, it returns the entire data set.  No results will be an empty array (`[]`).

Options are passed in as query parameters in the format of `&__{option}={value}` in the query string, and unlock the power of MongoDB's `find()` API.

Option   | Description
-------- | -------------
limit    | Limits the result set count to the supplied value.
skip     | Number of records to skip (offset).
sort     | Sorts the record according to provided [shorthand sort syntax](http://mongoosejs.com/docs/api.html#query_Query-sort) (e.g. `&__sort=-name`).
populate | Populates object references with the full resource (e.g. `&__populate=users`).
count    | When present, returns the resulting count in an array (e.g. `[38]`).
near     | Performs a geospatial query on given coordinates and an optional range (in meters), sorted by distance by default. Required format: `{longitude},{latitude},{range}`

Mongoose SCRUD also supports range queries. To perform a range query, pass in a stringified JSON object into the field on the request.

```
GET /api/posts?createdAt={"$gt":"2013-01-01T00:00:00.000Z"}
```

Using `ngResource` in AngularJS, performing a range query is easy:

```
// Find posts created on or after 1/1/2013.
Posts.query({
	createdAt: JSON.stringify({
		$gte: new Date('2013-01-01')
	})
});
```

### Create
```
function(req, res, next) {
	scud.create(req.body, {relate: true}, function(error, results) {
	  error ? response.json(500, {code: 'MongoError', message: error}) : response.json(200, results);
	});
}
```
Posting (or putting, if enabled) to the create route validates the incoming data and creates a new resource in the collection. Upon validation failure, a `400` error with details will be returned to the client. On success, a status code of `201` will be issued and the new resource will be returned.

### Options

#### relate
Experimental feature that automatically populates references on create. Default: `false`.

### Read
```
function(req, res, next) {
	User.read(id, req.query, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```
The read path returns a single resource object in the collection that matches a given id. If the resource does not exist, a `404` is returned.

### Update
```
function(req, res, next) {
	User.update(id, req.body, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```
Posting (or putting, if enabled) to the update route will validate the incoming data and update the existing resource in the collection and respond with `204` if successful. Upon validation failure, a `400` error with details will be returned to the client. A `404` will be returned if the resource did not exist.

### Delete
```
function(req, res, next) {
	User.del(id, {relate: true}, function(error, results) {
	  error ? res.json(500, {code: 'MongoError', message: error}) : res.json(200, results);
	});
}
```
Issuing a delete request to this route will result in the deletion of the resource and a `204` response if successful. If there was no resource, a `404` will be returned.

### Options

#### relate
Experimental feature that automatically remove references on delete. Default: `false`.

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

Advanced validation for the create and update routes may be achieved using the `pre` hook, for example:

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
Mongoose SCRUD will return a `400` with the error object passed by your middleware.

```
{
	name: 'ValidateLength',
	message: 'Comments must be longer than 5 characters.'
}
```

## Roadmap

* Examples and documentation on integration.

## Changelog

### 0.2.3 | 10/17/2015

FIX: Coerce limit to number in search

### 0.2.2 | 10/15/2015

FIX: `this` management.

### 0.2.1 | 10/15/2015

FIX: fix model references in search.

### 0.2.0 | 10/11/2014
* Beta release:
FEATURE: Add Regex support to `search()` method for `LIKE` queries
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

Based on from [meanify](https://github.com/artzstudio/meanify).

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
