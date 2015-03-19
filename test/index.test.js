/**!
 * urlmock - test/index.test.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var assert = require('assert');
var path = require('path');
var urlmock = require('../');
var datadir = path.join(__dirname, 'fixtures');

describe('urlmock', function () {
  describe('mapping()', function () {
    it('should get all vaild paths', function () {
      var paths = urlmock.mapping(datadir, '/foo/user.htm');
      assert.deepEqual(paths, [
        path.join(datadir, 'foo', 'user.htm', 'default.js'),
        path.join(datadir, 'foo', 'user.htm', 'default.json'),
        path.join(datadir, 'foo', 'user', 'default.js'),
        path.join(datadir, 'foo', 'user', 'default.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/bar/user.htm?__scene=foo.bar');
      assert.deepEqual(paths, [
        path.join(datadir, 'bar', 'user.htm', 'foo.bar.js'),
        path.join(datadir, 'bar', 'user.htm', 'foo.bar.json'),
        path.join(datadir, 'bar', 'user', 'foo.bar.js'),
        path.join(datadir, 'bar', 'user', 'foo.bar.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/bar/user.json?__scene=foo.bar');
      assert.deepEqual(paths, [
        path.join(datadir, 'bar', 'user.json', 'foo.bar.js'),
        path.join(datadir, 'bar', 'user.json', 'foo.bar.json'),
        path.join(datadir, 'bar', 'user', 'foo.bar.js'),
        path.join(datadir, 'bar', 'user', 'foo.bar.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/bar/user/?__scene=foo.bar');
      assert.deepEqual(paths, [
        path.join(datadir, 'bar', 'user', 'foo.bar.js'),
        path.join(datadir, 'bar', 'user', 'foo.bar.json'),
      ]);
    });

    it('should get default scene', function () {
      var paths = urlmock.mapping(datadir, '/');
      assert.deepEqual(paths, [
        path.join(datadir, 'default.js'),
        path.join(datadir, 'default.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/?__scene');
      assert.deepEqual(paths, [
        path.join(datadir, 'default.js'),
        path.join(datadir, 'default.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/foo?__scene=default');
      assert.deepEqual(paths, [
        path.join(datadir, 'foo', 'default.js'),
        path.join(datadir, 'foo', 'default.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/foo?__scene=default.js');
      assert.deepEqual(paths, [
        path.join(datadir, 'foo', 'default.js'),
        path.join(datadir, 'foo', 'default.json'),
      ]);

      var paths = urlmock.mapping(datadir, '/foo?__scene=%20%20%20');
      assert.deepEqual(paths, [
        path.join(datadir, 'foo', 'default.js'),
        path.join(datadir, 'foo', 'default.json'),
      ]);
    });
  });

  describe('load()', function () {
    it('should load default data contains __requires: string', function () {
      var data = urlmock.load(path.join(datadir, 'default.js'));
      assert.deepEqual(data, {
        name: 'fengmk2',
        age: 18,
        isAdmin: false,
        logined: false,
        links: {
          github: {
            name: 'fengmk2',
            url: 'https://github.com/fengmk2'
          },
          twitter: {
            name: 'fengmk2',
            url: 'https://twitter.com/name'
          },
          weibo: {
            name: 'fengmk2'
          }
        },
        ip: '127.0.0.1'
      });
    });

    it('should support array json', function () {
      var data = urlmock.load(path.join(datadir, 'array.json'));
      assert(Array.isArray(data), 'data should be an Array');
      assert.deepEqual(data, [1, 2, 3]);

      data = urlmock.load(path.join(datadir, 'jsarray.js'));
      assert(Array.isArray(data), 'data should be an Array');
      assert.deepEqual(data, [4, 5]);
    });

    it('should load data contains __requires: [r1, r2, ...]', function () {
      var data = urlmock.load(path.join(datadir, 'admin.js'));
      assert.deepEqual(data, {
        name: 'fengmk2',
        age: 18,
        isAdmin: true,
        logined: false,
        links: {
          github: {
            name: 'fengmk2',
            url: 'https://github.com/fengmk2'
          },
          twitter: {
            name: 'fengmk2',
            url: 'https://twitter.com/name'
          },
          weibo: {
            name: 'fengmk2'
          }
        },
        ip: '127.0.0.1'
      });
    });

    it('should work with r1 require r2,r3 and r2 require r3', function () {
      var data = urlmock.load(path.join(datadir, 'logined.js'));
      assert.deepEqual(data, {
        name: 'common-user-name',
        age: 18,
        isAdmin: false,
        logined: true,
        links: {
          github: {
            name: 'github-name',
            url: 'https://github.com/github-name'
          },
          twitter: {
            name: 'twitter-name',
            url: 'https://twitter.com/name'
          }
        },
        ip: '127.0.0.1'
      });
    });

    it('should throw error when file not exists', function () {
      assert.throws(function () {
        urlmock.load('not-exists');
      }, function (err) {
        assert.equal(err.code, 'MODULE_NOT_FOUND');
        assert.equal(err.message, "Cannot find module 'not-exists'");
        return true;
      });
    });
  });

  describe('urlmock()', function () {
    it('`/?__scene` (meaning `/?__scene=default`) => `/mocks/default.js`', function () {
      assert.deepEqual(urlmock(datadir, '/'), {
        name: 'fengmk2',
        age: 18,
        isAdmin: false,
        logined: false,
        links: {
          github: {
            name: 'fengmk2',
            url: 'https://github.com/fengmk2'
          },
          twitter: {
            name: 'fengmk2',
            url: 'https://twitter.com/name'
          },
          weibo: {
            name: 'fengmk2'
          }
        },
        ip: '127.0.0.1'
      });

      assert.deepEqual(urlmock(datadir, '/'), urlmock(datadir, '/?__scene=default'));
      assert.deepEqual(urlmock(datadir, '/?__scene'), urlmock(datadir, '/?__scene=default'));
      assert.deepEqual(urlmock(datadir, '/?__scene='), urlmock(datadir, '/?__scene=default'));
    });

    it('load data with ctx', function () {
      assert.deepEqual(urlmock(datadir, {
        url: '/?__scene=data_with_ctx',
        query: {
          foo: 'bar'
        }
      }), {
        query: {
          foo: 'bar'
        },
        url: '/?__scene=data_with_ctx'
      });

      assert.deepEqual(urlmock(datadir, {
        url: '/?__scene=data_with_ctx&foo=bar',
        query: {
          foo: 'bar'
        }
      }), {
        query: {
          foo: 'bar'
        },
        url: '/?__scene=data_with_ctx&foo=bar'
      });
    });

    it('`/users?__scene=other` => `/mocks/users/other.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users?__scene=other'), {
        name: 'other'
      });
    });

    it('`/users/?__scene=second` => `/mocks/users/second.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users?__scene=second'), {
        name: 'second',
        age: 18,
        isAdmin: false,
        logined: false,
        links: {
          github: {
            name: 'github-name',
            url: 'https://github.com/github-name'
          },
          twitter: {
            name: 'twitter-name',
            url: 'https://twitter.com/name'
          }
        },
        ip: '127.0.0.1'
      });
    });

    it('`/users/123.html?__scene` => `/mocks/users/123.html/default.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users/123.html?__scene'), {
        name: 'default'
      });
    });

    it('`/users/123.json?__scene` => `/mocks/users/123.json/default.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users/123.json?__scene'), {
        name: 'default.json'
      });
    });

    it('`/users/123.json?__scene=one` => `/mocks/users/123.json/one.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users/123.json?__scene=one'), {
        name: 'one.json'
      });
    });

    it('`/users/123?__scene=one` => `/mocks/users/123/one.js`', function () {
      assert.deepEqual(urlmock(datadir, '/users/123?__scene=one'), {
        name: 'one'
      });
    });

    it('`/sofax/posts/1984.html?__scene=one` => `/mocks/sofax/posts/1984/one.js`', function () {
      assert.deepEqual(urlmock(datadir, '/sofax/posts/1984.html?__scene=one'), {
        id: '1984'
      });
    });

    it('`/sofax/posts/1984?__scene=one` => `/mocks/sofax/posts/1984/one.js`', function () {
      assert.deepEqual(urlmock(datadir, '/sofax/posts/1984?__scene=one'), {
        id: '1984'
      });
    });

    it('should throw error when mock file not exists', function () {
      assert.throws(function () {
        urlmock(datadir, '/not-exists');
      }, function (err) {
        assert(/Cannot find mock data file in/.test(err.message), err.message);
        return true;
      });
    });

    it('should throw error when mock file excute fail', function () {
      assert.throws(function () {
        urlmock(datadir, '/?__scene=fail');
      }, function (err) {
        assert.equal(err.name, 'ReferenceError');
        assert.equal(err.message, 'foo is not defined');
        return true;
      });
    });

    it('`/profile?__scene=normal user (default.js)` => `/mocks/profile/default.js`', function () {
      assert.deepEqual(urlmock(datadir, '/profile?__scene=normal user (default.js)'), {
        name: 'jack',
      });
    });

    it('`/profile?__scene=lucy` => `/mocks/profile/lucy.js`', function () {
      assert.deepEqual(urlmock(datadir, '/profile?__scene=lucy'), {
        name: 'lucy luo',
      });
    });

    it('`/profile?__scene=马 yun yun (ma.js)` => `/mocks/profile/ma.js`', function () {
      assert.deepEqual(urlmock(datadir, '/profile?__scene=' + encodeURIComponent('马 yun yun (ma.js)')), {
        name: 'jack ma',
      });

      assert.deepEqual(urlmock(datadir, '/profile?__scene=' + encodeURIComponent('马 yun yun (ma.js)')),
        urlmock(datadir, '/profile?__scene=ma'));
    });
  });

  describe('findAllScenes()', function () {
    it('should find out all exists scenes', function () {
      var data = urlmock.findAllScenes(datadir, '/');
      assert.deepEqual(data, {
        'admin.js': 'admin',
        'array.json': 'array',
        'data_with_ctx.js': 'data_with_ctx',
        'default.js': 'default',
        'fail.js': 'fail',
        'jsarray.js': 'jsarray',
        'logined.js': 'logined'
      });

      var data = urlmock.findAllScenes(datadir, '/users');
      assert.deepEqual(data, {
        'other.js': 'other',
        'second.js': 'second'
      });

      var data = urlmock.findAllScenes(datadir, '/users.');
      assert.deepEqual(data, {});

      var data = urlmock.findAllScenes(datadir, '/users.html');
      assert.deepEqual(data, {
        'other.js': 'other',
        'second.js': 'second'
      });

      var data = urlmock.findAllScenes(datadir, '/users/123');
      assert.deepEqual(data, {
        'one.js': 'one'
      });

      var data = urlmock.findAllScenes(datadir, '/users/123.html');
      assert.deepEqual(data, {
        'default.js': 'default'
      });
    });

    it('should support `__name` in mock data file', function () {
      var data = urlmock.findAllScenes(datadir, '/profile');
      assert.deepEqual(data, {
        'default.js': 'normal user',
        'lucy.js': 'lucy',
        'ma.js': '马 yun yun'
      });
    });
  });
});
