// This file is written as an AMD module that will be loaded by the Intern
// test client. The test client can load node modules directly to test
// that individual pieces are working as expected.
//
// The flow for each test is generally:
//   1. Load the module you wish to perform unit tests on
//   2. Call the functions of that module directly and use the assert
//      library to verify expected results
//
// More info on writing Unit tests with Intern:
//    https://theintern.github.io/intern/#writing-unit-test
//
// We have chosen to use Intern's "BDD" interface (as opposed to the other
// options that Intern provides - "Object," "TDD," and "QUnit"):
//    https://theintern.github.io/intern/#interface-tdd/
//
// We have chosen to use Chai's "assert" library (as opposed to the other
// options that Chai provides - "expect" and "should"):
//    http://chaijs.com/api/assert/

define(function(require) {
  const bdd = require('intern!bdd');
  const assert = require('intern/chai!assert');
  const fs = require('intern/dojo/node!fs');
  const path = require('intern/dojo/node!path');
  const del = require('intern/dojo/node!del');

  const publicDir = 'dist/public';

  bdd.describe('Node unit', function() {
    bdd.before(function() {
      // This modifies the node module loader to work with es2015 modules.
      // All subsequent `require` calls that use the node module loader
      // will use this modified version and will be able to load es2015
      // modules.
      require('intern/dojo/node!babel-core/register');
    });

    bdd.describe('Build process', function() {
      bdd.it('should output readable expected files and only expected files', function() {
        // Please keep this list alphabetically sorted. It is case sensitive.
        var expectedFiles = [
          'dist/public/bundle.css',
          'dist/public/bundle.css.map',
          'dist/public/bundle.js',
          'dist/public/bundle.js.map',
          'dist/public/images/browsers/chrome_64x64.png',
          'dist/public/images/browsers/edge_64x64.png',
          'dist/public/images/browsers/firefox_64x64.png',
          'dist/public/images/browsers/firefox-beta_64x64.png',
          'dist/public/images/browsers/firefox-developer-edition_64x64.png',
          'dist/public/images/browsers/firefox-nightly_64x64.png',
          'dist/public/images/browsers/safari_64x64.png',
          'dist/public/images/browsers/opera_64x64.png',
          'dist/public/images/anchor.svg',
          'dist/public/images/bugzilla.png',
          'dist/public/images/bugzilla@2x.png',
          'dist/public/images/caniuse.png',
          'dist/public/images/caniuse@2x.png',
          'dist/public/images/favicon-192.png',
          'dist/public/images/favicon-196.png',
          'dist/public/images/favicon.ico',
          'dist/public/images/firefox.svg',
          'dist/public/images/github.png',
          'dist/public/images/github@2x.png',
          'dist/public/images/html5.png',
          'dist/public/images/html5@2x.png',
          'dist/public/images/ios-icon-180.png',
          'dist/public/images/mdn.png',
          'dist/public/images/mdn@2x.png',
          'dist/public/images/tabzilla-static.png',
          'dist/public/images/tabzilla-static-high-res.png',
          'dist/public/index.html',
          'dist/public/manifest.json',
          'dist/public/offline-worker.js',
          'dist/public/status.json',
          'dist/public/app-manifest.html',
          'dist/public/permissions_revoke.html',
          'dist/public/permissions_request.html',
          'dist/public/asmjs.html',
          'dist/public/pointerlock.html',
          'dist/public/background-sync.html',
          'dist/public/promise.html',
          'dist/public/canvas-media-capture.html',
          'dist/public/push.html',
          'dist/public/css-variables.html',
          'dist/public/screen-orientation.html',
          'dist/public/custom-elements.html',
          'dist/public/service-worker.html',
          'dist/public/device-orientation.html',
          'dist/public/shadow-dom.html',
          'dist/public/fetch.html',
          'dist/public/shared-worker.html',
          'dist/public/fullscreen.html',
          'dist/public/shared_array_buffer.html',
          'dist/public/gamepad.html',
          'dist/public/streams.html',
          'dist/public/html-imports.html',
          'dist/public/offscreencanvas.html',
          'dist/public/vibration.html',
          'dist/public/html-templates.html',
          'dist/public/web-assembly.html',
          'dist/public/htmlcanvaselement-toblob.html',
          'dist/public/web-bluetooth.html',
          'dist/public/webaudio.html',
          'dist/public/indexeddb.html',
          'dist/public/webgl-1.html',
          'dist/public/media-recorder.html',
          'dist/public/webgl-2.html',
          'dist/public/mse.html',
          'dist/public/webrtc.html',
          'dist/public/page-visibility.html',
          'dist/public/websocket.html',
          'dist/public/permissions.html',
          'dist/public/webspeech-synthesis.html'
        ];

        var ignoreDirs = [
        ];

        function processPath(filepath) {
          return new Promise(function(resolve, reject) {
            if (ignoreDirs.indexOf(filepath) > -1) {
              resolve();
            }
            fs.stat(filepath, function(statErr, stats) {
              if (statErr) {
                return reject(filepath + ': ' + statErr);
              }

              if (stats.isFile()) {
                return fs.access(filepath, fs.F_OK | fs.R_OK, function(accessErr) {
                  if (accessErr) {
                    return reject(filepath + ': ' + accessErr);
                  }

                  var index = expectedFiles.indexOf(filepath);
                  if (index === -1) {
                    return reject(new Error('Unexpected file: ' + filepath));
                  }
                  expectedFiles.splice(index, 1);

                  return resolve();
                });
              }

              if (stats.isDirectory()) {
                return fs.readdir(filepath, function(readErr, files) {
                  if (readErr) {
                    return reject(filepath + ': ' + readErr);
                  }

                  var promises = files.map(function(filename) {
                    var dirpath = filepath + '/' + filename;
                    return processPath(dirpath);
                  });

                  return Promise.all(promises)
                    .then(resolve)
                    .catch(reject);
                });
              }

              return reject(filepath + ' is not a file or a directory');
            });
          });
        }

        return processPath(publicDir).then(function() {
          if (expectedFiles.length !== 0) {
            throw new Error('File(s) not found: ' + expectedFiles);
          }
        });
      });
    });

    bdd.describe('Engine', function() {
      bdd.describe('fixtureParser', function() {
        bdd.it('should something', function() {
          var FixtureParser = require('intern/dojo/node!../../../../engine/fixtureParser').default;
          var fp = new FixtureParser('asdf');
          assert(fp);
        });
      });

      bdd.describe('normalizeStatus', function() {
        bdd.it('should convert empty strings', function() {
          var indexJS = require('intern/dojo/node!../../../../engine/index').test;
          assert.equal(indexJS.normalizeStatus(''), 'unknown');
        });

        bdd.it('should leave known strings untouched', function() {
          var indexJS = require('intern/dojo/node!../../../../engine/index').test;

          var strings = [
            'unknown',
            'not-planned',
            'deprecated',
            'under-consideration',
            'in-development',
            'shipped',
          ];

          strings.forEach(function(val) {
            assert.equal(indexJS.normalizeStatus(val), val);
          });
        });

        bdd.it('should throw Error objects for invalid strings', function() {
          var indexJS = require('intern/dojo/node!../../../../engine/index').test;
          assert.throws(indexJS.normalizeStatus.bind(null, 'asdf'));
          assert.throws(indexJS.normalizeStatus.bind(null, 'a string'));

          assert.throws(indexJS.normalizeStatus.bind(null, '-8023'));
          assert.throws(indexJS.normalizeStatus.bind(null, '91257'));

          assert.throws(indexJS.normalizeStatus.bind(null, 1234));
          assert.throws(indexJS.normalizeStatus.bind(null, -1234));

          assert.throws(indexJS.normalizeStatus.bind(null, null));
          assert.throws(indexJS.normalizeStatus.bind(null));
        });
      });
    });

    bdd.describe('Cache', function() {
      const cache = require('intern/dojo/node!../../../../engine/cache').default;
      const cacheDir = 'tests/support/var/engineCache';
      const fetchMock = require('intern/dojo/node!fetch-mock');

      bdd.before(function() {
        // Create the tests var dir if it doesn't already exist
        const dir = path.dirname(cacheDir);

        var stats;
        try {
          stats = fs.statSync(dir);
          if (!stats.isDirectory()) {
            throw new Error('tests var dir exists but is not a directory');
          }
        } catch (statErr) {
          if (statErr.code !== 'ENOENT') {
            throw statErr;
          }

          fs.mkdirSync(dir);
        }

        // The test cache dir shouldn't exist, but delete it if it does
        return del([cacheDir]);
      });

      bdd.afterEach(function() {
        // Remove the test cache dir
        return del([cacheDir]);
      });

      bdd.beforeEach(function() {
        // Don't let tests interfere with each other's calls to `fetch`
        fetchMock.reset();

        // Make dir to cache files to during tests
        fs.mkdirSync(cacheDir);
      });

      bdd.it('should cache files', function() {
        const testURL = 'https://raw.githubusercontent.com/mozilla/platatus/master/package.json';

        // Cache our package.json file
        return cache.readJson(testURL, cacheDir).then(function(originalText) {
          // Cause the next fetch to fail
          fetchMock.mock(testURL, 404);

          // Get our package.json (should succeed from cache)
          return cache.readJson(testURL, cacheDir).then(function(cachedText) {
            // Compare the original text with the cached text
            assert.equal(JSON.stringify(cachedText), JSON.stringify(originalText));
          });
        });
      });

      bdd.it('should reject on 404s', function() {
        const testURL = 'https://raw.githubusercontent.com/mozilla/platatus/master/package.json';

        // Cause the fetch to 404
        fetchMock.mock(testURL, 404);

        return cache.readJson(testURL, cacheDir).then(function() {
          assert.fail('`cache.readJson` should have rejected on a 404');
        }).catch(function(err) {
          assert(err instanceof Error);
          return true;
        });
      });
    });
  });
});
