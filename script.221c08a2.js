// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"script.ts":[function(require,module,exports) {
"use strict";

var canvas = document.querySelector("#game");
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var TILE_SIZE = 15;
var TILES_X = width / TILE_SIZE;
var TILES_Y = height / TILE_SIZE;
ctx.fillStyle = "rgb(100, 240, 150)";
ctx.strokeStyle = "rgb(90, 90, 90)";
ctx.lineWidth = 0.5; // retina
// https://stackoverflow.com/questions/7530593/html5-canvas-and-line-width/7531540#7531540

var isGamePaused = false;
var devModeDiscovered = false;
var gameSpeed = 1000;
var tempOrigin = [0, 0];
var tempTupleArray = []; // structures that have keybindings

var gliderFound = false; // g OR // 0

var blinkerFound = false; // b

var beaconFound = false; // e

var toadFound = false; // t

var pulsarFound = false; // a

var lightWeightSpaceshipFound = false; // 1

var middleWeightSpaceshipFound = false; // 2

var heavyWeightSpaceshipFound = false; // 3

var gosperGunFound = false; // 4

var pentaDecathlonFound = false; // 5

var drawBorders = function drawBorders() {
  for (var i = 0; i < TILES_X; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE - 0.5, 0);
    ctx.lineTo(i * TILE_SIZE - 0.5, height);
    ctx.stroke();
  }

  for (var i = 0; i < TILES_Y; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE - 0.5);
    ctx.lineTo(width, i * TILE_SIZE - 0.5);
    ctx.stroke();
  }
};

var prepareBoard = function prepareBoard() {
  var board = [];

  for (var i = 0; i < TILES_X; i++) {
    var row = [];

    for (var j = 0; j < TILES_Y; j++) {
      row.push(false);
    }

    board.push(row);
  }

  return board;
};

var BOARD = prepareBoard();

var isAlive = function isAlive(x, y) {
  if (x < 0 || x >= TILES_X || y < 0 || y >= TILES_Y) {
    return 0;
  }

  return BOARD[x][y] ? 1 : 0;
};

var neighboursCount = function neighboursCount(x, y) {
  var count = 0;

  for (var _i = 0, _a = [-1, 0, 1]; _i < _a.length; _i++) {
    var i = _a[_i];

    for (var _b = 0, _c = [-1, 0, 1]; _b < _c.length; _b++) {
      var j = _c[_b];

      if (!(i === 0 && j === 0)) {
        count += isAlive(x + i, y + j);
      }
    }
  }

  return count;
};

var drawBoard = function drawBoard() {
  for (var i = 0; i < TILES_X; i++) {
    for (var j = 0; j < TILES_X; j++) {
      if (!isAlive(i, j)) {
        continue;
      }

      ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
};

var computeNextGeneration = function computeNextGeneration() {
  var board = prepareBoard();

  for (var i = 0; i < TILES_X; i++) {
    for (var j = 0; j < TILES_X; j++) {
      if (isAlive(i, j)) {
        var count = neighboursCount(i, j);

        if (count === 2 || count === 3) {
          board[i][j] = true;
        }
      } else {
        if (neighboursCount(i, j) === 3) {
          board[i][j] = true;
        }
      }
    }
  }

  return board;
};

var clear = function clear() {
  ctx.clearRect(0, 0, width, height);
};

var drawAll = function drawAll() {
  clear();
  drawBoard();
  drawBorders();
};

var nextGen = function nextGen() {
  if (isGamePaused) {
    return;
  }

  BOARD = computeNextGeneration();
  drawAll();
};

var nextGenLoop = function nextGenLoop() {
  nextGen();
  setTimeout(nextGenLoop, gameSpeed);
}; // creates glider at top left corner 
// (all coords start from bottom right quadrant but no negatives)

/*
BOARD[1][0] = true;
BOARD[2][1] = true;
BOARD[0][2] = true;
BOARD[1][2] = true;
BOARD[2][2] = true;
*/


var genRandom = function genRandom(min, max) {
  return Math.ceil((Math.random() * 10000 + min) % max);
};

var renderPoints = function renderPoints(points, ranX, ranY) {
  for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
    var point = points_1[_i];
    BOARD[ranX + point[0]][ranY + point[1]] = true;
  }
}; // spawn functions


var glider = function glider() {
  var points = [[0, 0], [1, 1], [1, 2], [2, 0], [2, 1]];
  renderPoints(points, genRandom(3, TILES_X - 3), genRandom(3, TILES_Y - 3));
};

var blinker = function blinker() {
  var points = [[0, 0], [1, 0], [2, 0]];
  renderPoints(points, genRandom(3, TILES_X - 3), genRandom(3, TILES_Y - 3));
};

var beacon = function beacon() {
  var points = [[0, 0], [1, 0], [0, 1], [1, 1], [2, -2], [3, -2], [2, -1], [3, -1]];
  renderPoints(points, genRandom(5, TILES_X - 5), genRandom(5, TILES_Y - 5));
};

var toad = function toad() {
  var points = [[0, 0], [0, 1], [1, 2], [2, -1], [3, 0], [3, 1]];
  renderPoints(points, genRandom(4, TILES_X - 4), genRandom(3, TILES_Y - 3));
};

var pulsar = function pulsar() {
  var points = [[0, 0], [0, 1], [0, 2], [2, 3], [3, 3], [4, 3], [5, 2], [5, 1], [5, 0], [4, -2], [3, -2], [2, -2], [7, 0], [7, 1], [7, 2], [8, 3], [9, 3], [10, 3], [12, 2], [12, 1], [12, 0], [10, -2], [9, -2], [8, -2], [0, 6], [0, 7], [0, 8], [2, 10], [3, 10], [4, 10], [5, 8], [5, 7], [5, 6], [4, 5], [3, 5], [2, 5], [7, 6], [7, 7], [7, 8], [8, 10], [9, 10], [10, 10], [12, 8], [12, 7], [12, 6], [10, 5], [9, 5], [8, 5]];
  renderPoints(points, genRandom(15, TILES_X - 15), genRandom(15, TILES_Y - 15));
};

var lightWeightSpaceship = function lightWeightSpaceship() {
  var points = [[0, 0], [3, 0], [4, 1], [4, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 2]];
  renderPoints(points, genRandom(5, TILES_X - 5), genRandom(5, TILES_Y - 5));
};

var middleWeightSpaceship = function middleWeightSpaceship() {
  var points = [[0, 0], [0, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [5, 2], [5, 1], [4, 0], [2, -1]];
  renderPoints(points, genRandom(6, TILES_X - 6), genRandom(4, TILES_Y - 4));
};

var heavyWeightSpaceship = function heavyWeightSpaceship() {
  var points = [[0, 0], [0, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [6, 2], [6, 1], [5, 0], [3, -1], [2, -1]];
  renderPoints(points, genRandom(7, TILES_X - 7), genRandom(5, TILES_Y - 5));
};

var gosperGun = function gosperGun() {
  var points = [[0, 0], [0, 1], [1, 0], [1, 1], [13, -2], [12, -2], [11, -1], [10, 0], [10, 1], [10, 2], [11, 3], [12, 4], [13, 4], [14, 1], [15, -1], [16, 0], [16, 1], [17, 1], [16, 2], [15, 3], [20, 0], [20, -1], [20, -2], [21, -2], [21, -1], [21, 0], [22, 1], [22, -3], [24, -3], [24, -4], [24, 1], [24, 2], [34, -1], [34, -2], [35, -2], [35, -1]];
  renderPoints(points, genRandom(35, TILES_X - 35), genRandom(7, TILES_Y - 7));
};

var pentaDecathlon = function pentaDecathlon() {
  var points = [[0, 0], [1, 0], [2, 0], [3, 1], [4, 2], [5, 4], [5, 5], [4, 7], [3, 8], [2, 9], [1, 9], [0, 9], [-1, 8], [-2, 7], [-3, 5], [-3, 4], [-2, 2], [-1, 1]];
  renderPoints(points, genRandom(8, TILES_X - 8), genRandom(10, TILES_Y - 10));
}; // spawn functions ended, onto event listeners and main keypress listener for spawning


var reset = function reset() {
  if (!(tempOrigin[0] === 0 && tempOrigin[1] === 0)) {
    tempOrigin = [0, 0];
    console.log("tempOrigin: [0,0]");
  }

  tempTupleArray = [];
};

canvas.addEventListener("click", function (e) {
  if (e.button === 0) {
    var x = Math.floor((e.clientX - canvas.offsetLeft) / TILE_SIZE);
    var y = Math.floor((e.clientY - canvas.offsetTop) / TILE_SIZE);
    BOARD[x][y] = !BOARD[x][y];
    reset();
    drawAll();
  }
});
canvas.addEventListener("auxclick", function (e) {
  //console.log(e.button)
  if (e.button === 1) {
    if (!devModeDiscovered) {
      console.log("congrats you unlocked dev mode!!1!");
      devModeDiscovered = true;
    }

    var x = Math.floor((e.clientX - canvas.offsetLeft) / TILE_SIZE);
    var y = Math.floor((e.clientY - canvas.offsetTop) / TILE_SIZE); //console.log("works")

    if (tempOrigin[0] === 0 && tempOrigin[1] === 0) {
      tempOrigin = [x, y];
      console.log("tempOrigin: " + tempOrigin);
    } else {
      var relativeX = x - tempOrigin[0];
      var relativeY = y - tempOrigin[1];
      var relativeCoords = [relativeX, relativeY];
      tempTupleArray.push("[" + relativeX + "," + relativeY + "]");
      console.log("relative coords: " + relativeCoords);
      console.log("full tuple array: " + tempTupleArray);
    }
  }
});

var prepareRandom = function prepareRandom() {
  var board = prepareBoard();

  for (var i = 0; i < TILES_X; i++) {
    for (var j = 0; j < TILES_X; j++) {
      board[i][j] = Math.random() < 0.3; // 30% chance for true
    }
  }

  return board;
}; // pauses game of life to let user click


document.addEventListener("keydown", function (e) {
  // console.log(e.key)
  if (e.key === "p") {
    // pause
    isGamePaused = !isGamePaused;
  } else if (e.key === "r") {
    // random set of tiles generated
    BOARD = prepareRandom();
  } else if (e.key == "ArrowUp") {
    // increase speed
    gameSpeed = Math.max(50, gameSpeed - 50); // console.log("game speed changed", gameSpeed);
  } else if (e.key == "ArrowDown") {
    // decrease speed
    gameSpeed = Math.max(gameSpeed, gameSpeed + 50); // console.log("game speed changed", gameSpeed);

    if (gameSpeed > 2000) {
      gameSpeed = 2000; // console.log("game speed force changed big funny")
    }
  } else if (e.key === "c") {
    // clears board
    BOARD = prepareBoard();
  } else if (e.key === "g") {
    glider();

    if (gliderFound == false) {
      console.log("well done! you found the glider spawn key! (g)");
      gliderFound = true;
    }
  } else if (e.key === "b") {
    blinker();

    if (blinkerFound == false) {
      console.log("well done! you found the blinker spawn key! (b)");
      blinkerFound = true;
    }
  } else if (e.key === "e") {
    beacon();

    if (beaconFound == false) {
      console.log("well done! you found the beacon spawn key! (e)");
    }
  } else if (e.key === "t") {
    toad();

    if (toadFound == false) {
      console.log("well done! you found the toad spawn key! (t)");
    }
  } else if (e.key === "a") {
    pulsar();

    if (pulsarFound == false) {
      console.log("well done! you found the pulsar spawn key! (a)");
      pulsarFound = true;
    }
  } else if (e.key === "1") {
    lightWeightSpaceship();

    if (lightWeightSpaceshipFound == false) {
      console.log("well done! you found the lightweight spaceship spawn key! (1)");
      lightWeightSpaceshipFound = true;
    }
  } else if (e.key === "2") {
    middleWeightSpaceship();

    if (middleWeightSpaceshipFound == false) {
      console.log("well done! you found the middleweight spaceship spawn key! (2)");
      middleWeightSpaceshipFound = true;
    }
  } else if (e.key === "3") {
    heavyWeightSpaceship();

    if (heavyWeightSpaceshipFound == false) {
      console.log("well done! you found the heavyweight spaceship spawn key! (3)");
      heavyWeightSpaceshipFound = true;
    }
  } else if (e.key === "4") {
    gosperGun();

    if (gosperGunFound == false) {
      console.log("well done! you found the spaceship spawn key! (4)");
      gosperGunFound = true;
    }
  } else if (e.key === "5") {
    pentaDecathlon();

    if (pentaDecathlonFound == false) {
      console.log("well done! you found the penta-decathlon spawn key! (5)");
      pentaDecathlonFound = true;
    }
  }
  /*
  else if (e.key === "9") {
      // spawn random static block for testing purposes
      block();
  }
  */

});
nextGenLoop();
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63849" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","script.ts"], null)
//# sourceMappingURL=/script.221c08a2.js.map