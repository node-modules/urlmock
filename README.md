urlmock
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/urlmock.svg?style=flat-square
[npm-url]: https://npmjs.org/package/urlmock
[travis-image]: https://img.shields.io/travis/node-modules/urlmock.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/urlmock
[coveralls-image]: https://img.shields.io/coveralls/node-modules/urlmock.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/node-modules/urlmock?branch=master
[gittip-image]: https://img.shields.io/gittip/fengmk2.svg?style=flat-square
[gittip-url]: https://www.gittip.com/fengmk2/
[david-image]: https://img.shields.io/david/node-modules/urlmock.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/urlmock
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/urlmock.svg?style=flat-square
[download-url]: https://npmjs.org/package/urlmock

Easy load mock data from a specify url.

---

## Features

- Simple url and mock file mapping rules.
- Support `*.js`, `*.json` and common datas.

## Installation

```bash
$ npm install urlmock
```

## URL Mapping Rules

Use `?__scene[={scene}]` to select mock scene, default scene is `default`.

### Rules

```
{url}?__scene={scene} => {datadir}{url}/{scene}.js
```

### Examples

- `{datadir}` equal `/foobar/test/mocks`

There are some mapping rules:

- `/?__scene` (meaning `/?__scene=default`) => `/foobar/test/mocks/default.js`
- `/users?__scene=other` => `/foobar/test/mocks/users/other.js`
- `/users/?__scene=second` => `/foobar/test/mocks/users/second.js`
- `/users/123.html?__scene` => `/foobar/test/mocks/users/123.html/default.js`
- `/users/123.json?__scene` => `/foobar/test/mocks/users/123.json/default.js`
- `/users/123.json?__scene=one` => `/foobar/test/mocks/users/123.json/one.js`
- `/users/123?__scene=one` => `/foobar/test/mocks/users/123/one.js`

So we will see total structure on `/foobar/test/mocks` like this:

- / (`GET /`)
    - default.js
    - users/ (`GET /users`)
        - default.js
        - other.js
        - second.js
        - 123.html/ (`GET /users/123.html`)
            - default.js
        - 123.json/ (`GET /users/123.json`)
            - default.js
            - one.js
        - 123/ (`GET /users/123`)
            - default.js
            - one.js
            - common.js

## Mock file format

### `*.js`: normal js file

`../common/user.js`

```js
module.exports = {
  name: 'mock-name',
  age:100,
  isAdmin: false,
  logined: false,
  homepage: 'http://ooxx.com/fengmk2',
  // .. other common user properties
};
```

`../common/admin.js`

```js
module.exports = {
  isAdmin: true,
  logined: true,
};
```

`./logined_user.js`

```js
module.exports = {
  logined: true,
};
```

`logined_admin.js`

```js
module.exports = {
  name: 'fengmk2',
  age: 18,
  // require common data
  __requires: ['../common/user', './logined_user', '../common/admin'],
};
```

Merge sequence:

Output <== `../common/user` <== `./logined_user` <== `../common/admin`

So `logined_admin.js` will merge all data:

```js
{
  name: 'fengmk2',
  age: 18,
  isAdmin: true,
  logined: true,
  homepage: 'http://ooxx.com/fengmk2',
  // .. other common user properties
}
```

### `*.json`: readonly json file

`foo.json`:

```json
{
  "name": "fengmk2",
  "age": 18,
  "logined": false
}
```

## Quick start

```js
var mockfile = require('mockfile');

var data = mockfile('/foobar/test/mocks', '/users/1984?__scene=newuser');
console.log(data);
// { name: 'fengmk2', age: 18 }
```

## API Reference

### #mockfile(datadir, url)

Get the url mapping mock data.

- datadir: store mock data directory path
- url: current request url

```js
var data = mockfile('/foobar/test/mocks', '/users/1984?__scene=newuser');
console.log(data);
// { name: 'fengmk2', age: 18 }
```

## License

MIT
