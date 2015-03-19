/**!
 * urlmock - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('urlmock');
var path = require('path');
var fs = require('fs');
var urlparse = require('url').parse;
var extend = require('extend');

module.exports = urlmock;
module.exports.mapping = mapping;
module.exports.load = load;
module.exports.findAllScenes = findAllScenes;

function urlmock(datadir, ctx) {
  // urlmock(datadir, koa-ctx)
  // urlmock(datadir, url)
  var url = typeof ctx === 'string' ? ctx : ctx.url;
  var paths = mapping(datadir, url);
  for (var i = 0; i < paths.length; i++) {
    var filepath = paths[i];
    try {
      var data = load(filepath, ctx);
      return data;
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }
  }
  throw new Error("Cannot find mock data file in '" + paths.join(', ') + "'");
}

// {url}?__scene={scene} => {datadir}{url}/{scene}.js
function mapping(datadir, url) {
  var info = urlparse(url, true);
  var pathname = info.pathname.replace(/^\/+/g, '');
  var scene = (info.query && info.query.__scene || '').trim();
  scene = scene || 'default';
  scene = scene.replace(/\.(js|json)$/, '');
  var m = / \(([^\)]+)\.(?:js|json)\)$/.exec(scene);
  if (m) {
    scene = m[1];
  }
  var paths = [
    path.join(datadir, pathname, scene + '.js'),
    path.join(datadir, pathname, scene + '.json'),
  ];
  // try to remove `.ext`, like `/user/foo.htm` => `/user/foo`
  var ext = path.extname(pathname);
  // should ignore `/foo.`
  if (ext && ext.length > 1) {
    pathname = pathname.substring(0, pathname.lastIndexOf('.'));
    paths.push(path.join(datadir, pathname, scene + '.js'));
    paths.push(path.join(datadir, pathname, scene + '.json'));
  }
  return paths;
}

function load(filepath, ctx) {
  var merged = {};
  var data = require(filepath);
  if (typeof data === 'function') {
    // module.exports = function load(ctx) {}
    data = data(ctx);
  }

  if (Array.isArray(data)) {
    return data;
  }

  // skip __requires, __name
  for (var key in data) {
    if (key === '__requires') {
      continue;
    }
    if (key === '__name') {
      continue;
    }
    merged[key] = data[key];
  }
  if (data.__requires) {
    var requires = data.__requires;
    // delete data.__requires;
    if (typeof requires === 'string') {
      // support `__requires: '../common'`
      requires = [requires];
    }

    // requireMerged <= r1 <= r2 <= r3
    var requireMerged = {};
    requires.forEach(function (requirepath) {
      requirepath = path.join(path.dirname(filepath), requirepath);
      var requireData = load(requirepath, ctx);
      extend(true, requireMerged, requireData);
    });

    // merged = requireMerged <= merged
    merged = extend(true, requireMerged, merged);
  }
  debug('load %s got %j', filepath, merged);
  return merged;
}

function findAllScenes(datadir, url) {
  var scenes = {};
  var info = urlparse(url, true);
  var pathname = info.pathname.replace(/^\/+/g, '');
  var dir = path.join(datadir, pathname);
  if (!fs.existsSync(dir)) {
    dir = null;
    // try to remove `.ext`, like `/user/foo.htm` => `/user/foo`
    var ext = path.extname(pathname);
    // should ignore `/foo.`
    if (ext && ext.length > 1) {
      pathname = pathname.substring(0, pathname.lastIndexOf('.'));
      dir = path.join(datadir, pathname);
    }
  }

  if (dir && fs.existsSync(dir)) {
    var filepaths = fs.readdirSync(dir).map(function (name) {
      return path.join(dir, name);
    }).filter(function (filepath) {
      if (fs.statSync(filepath).isDirectory()) {
        return false;
      }

      var ext = path.extname(filepath);
      if (ext === '.js' || ext === '.json') {
        return true;
      }
      return false;
    });

    filepaths.map(function (filepath) {
      var filename = path.basename(filepath);
      // use filename as default name
      var name = filename.substring(0, filename.lastIndexOf('.'));

      try {
        var data = require(filepath);
        if (data && data.__name) {
          name = data.__name;
        }
      } catch (_) {}

      scenes[filename] = name;
    });
  }
  return scenes;
}
