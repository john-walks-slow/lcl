(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["feathers"] = factory();
	else
		root["feathers"] = factory();
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/debug/src/browser.js":
/*!***********************************************!*
  !*** ../../node_modules/debug/src/browser.js ***!
  \***********************************************/
/***/ (function(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

exports.destroy = function () {
  var warned = false;
  return function () {
    if (!warned) {
      warned = true;
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
  };
}();
/**
 * Colors.
 */


exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */


exports.log = console.debug || console.log || function () {};
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  } // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(/*! ./common */ "../../node_modules/debug/src/common.js")(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};

/***/ }),

/***/ "../../node_modules/debug/src/common.js":
/*!**********************************************!*
  !*** ../../node_modules/debug/src/common.js ***!
  \**********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(/*! ms */ "../../node_modules/ms/index.js");
  createDebug.destroy = destroy;
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;
    var enableOverride = null;

    function debug() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // Disabled?
      if (!debug.enabled) {
        return;
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return '%';
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.useColors = createDebug.useColors();
    debug.color = createDebug.selectColor(namespace);
    debug.extend = extend;
    debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: function get() {
        return enableOverride === null ? createDebug.enabled(namespace) : enableOverride;
      },
      set: function set(v) {
        enableOverride = v;
      }
    }); // Env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    return debug;
  }

  function extend(namespace, delimiter) {
    var newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }
  }
  /**
  * Disable debug output.
  *
  * @return {String} namespaces
  * @api public
  */


  function disable() {
    var namespaces = [].concat(_toConsumableArray(createDebug.names.map(toNamespace)), _toConsumableArray(createDebug.skips.map(toNamespace).map(function (namespace) {
      return '-' + namespace;
    }))).join(',');
    createDebug.enable('');
    return namespaces;
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Convert regexp to namespace
  *
  * @param {RegExp} regxep
  * @return {String} namespace
  * @api private
  */


  function toNamespace(regexp) {
    return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, '*');
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }
  /**
  * XXX DO NOT USE. This is a temporary stub function.
  * XXX It WILL be removed in the next major release.
  */


  function destroy() {
    console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;

/***/ }),

/***/ "./src/core.js":
/*!*********************!*
  !*** ./src/core.js ***!
  \*********************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__(/*! @feathersjs/feathers */ "../feathers/lib/index.js");

/***/ }),

/***/ "../commons/lib/hooks.js":
/*!*******************************!*
  !*** ../commons/lib/hooks.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.enableHooks = exports.processHooks = exports.getHooks = exports.isHookObject = exports.convertHookData = exports.makeArguments = exports.defaultMakeArguments = exports.createHookObject = exports.ACTIVATE_HOOKS = void 0;

var utils_1 = __webpack_require__(/*! ./utils */ "../commons/lib/utils.js");

var _utils_1$_ = utils_1._,
    each = _utils_1$_.each,
    pick = _utils_1$_.pick;
exports.ACTIVATE_HOOKS = utils_1.createSymbol('__feathersActivateHooks');

function createHookObject(method) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var hook = {};
  Object.defineProperty(hook, 'toJSON', {
    value: function value() {
      return pick(this, 'type', 'method', 'path', 'params', 'id', 'data', 'result', 'error');
    }
  });
  return Object.assign(hook, data, {
    method: method,

    // A dynamic getter that returns the path of the service
    get path() {
      var app = data.app,
          service = data.service;

      if (!service || !app || !app.services) {
        return null;
      }

      return Object.keys(app.services).find(function (path) {
        return app.services[path] === service;
      });
    }

  });
}

exports.createHookObject = createHookObject; // Fallback used by `makeArguments` which usually won't be used

function defaultMakeArguments(hook) {
  var result = [];

  if (typeof hook.id !== 'undefined') {
    result.push(hook.id);
  }

  if (hook.data) {
    result.push(hook.data);
  }

  result.push(hook.params || {});
  return result;
}

exports.defaultMakeArguments = defaultMakeArguments; // Turns a hook object back into a list of arguments
// to call a service method with

function makeArguments(hook) {
  switch (hook.method) {
    case 'find':
      return [hook.params];

    case 'get':
    case 'remove':
      return [hook.id, hook.params];

    case 'update':
    case 'patch':
      return [hook.id, hook.data, hook.params];

    case 'create':
      return [hook.data, hook.params];
  }

  return defaultMakeArguments(hook);
}

exports.makeArguments = makeArguments; // Converts different hook registration formats into the
// same internal format

function convertHookData(obj) {
  var hook = {};

  if (Array.isArray(obj)) {
    hook = {
      all: obj
    };
  } else if (_typeof(obj) !== 'object') {
    hook = {
      all: [obj]
    };
  } else {
    each(obj, function (value, key) {
      hook[key] = !Array.isArray(value) ? [value] : value;
    });
  }

  return hook;
}

exports.convertHookData = convertHookData; // Duck-checks a given object to be a hook object
// A valid hook object has `type` and `method`

function isHookObject(hookObject) {
  return _typeof(hookObject) === 'object' && typeof hookObject.method === 'string' && typeof hookObject.type === 'string';
}

exports.isHookObject = isHookObject; // Returns all service and application hooks combined
// for a given method and type `appLast` sets if the hooks
// from `app` should be added last (or first by default)

function getHooks(app, service, type, method) {
  var appLast = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var appHooks = app.__hooks[type][method] || [];
  var serviceHooks = service.__hooks[type][method] || [];

  if (appLast) {
    // Run hooks in the order of service -> app -> finally
    return serviceHooks.concat(appHooks);
  }

  return appHooks.concat(serviceHooks);
}

exports.getHooks = getHooks;

function processHooks(hooks, initialHookObject) {
  var _this = this;

  var hookObject = initialHookObject;

  var updateCurrentHook = function updateCurrentHook(current) {
    // Either use the returned hook object or the current
    // hook object from the chain if the hook returned undefined
    if (current) {
      if (!isHookObject(current)) {
        throw new Error("".concat(hookObject.type, " hook for '").concat(hookObject.method, "' method returned invalid hook object"));
      }

      hookObject = current;
    }

    return hookObject;
  }; // Go through all hooks and chain them into our promise


  var promise = hooks.reduce(function (current, fn) {
    // @ts-ignore
    var hook = fn.bind(_this); // Use the returned hook object or the old one

    return current.then(function (currentHook) {
      return hook(currentHook);
    }).then(updateCurrentHook);
  }, Promise.resolve(hookObject));
  return promise.then(function () {
    return hookObject;
  }).catch(function (error) {
    // Add the hook information to any errors
    error.hook = hookObject;
    throw error;
  });
}

exports.processHooks = processHooks; // Add `.hooks` functionality to an object

function enableHooks(obj, methods, types) {
  if (typeof obj.hooks === 'function') {
    return obj;
  }

  var hookData = {};
  types.forEach(function (type) {
    // Initialize properties where hook functions are stored
    hookData[type] = {};
  }); // Add non-enumerable `__hooks` property to the object

  Object.defineProperty(obj, '__hooks', {
    configurable: true,
    value: hookData,
    writable: true
  });
  return Object.assign(obj, {
    hooks: function hooks(allHooks) {
      var _this2 = this;

      each(allHooks, function (current, type) {
        // @ts-ignore
        if (!_this2.__hooks[type]) {
          throw new Error("'".concat(type, "' is not a valid hook type"));
        }

        var hooks = convertHookData(current);
        each(hooks, function (_value, method) {
          if (method !== 'all' && methods.indexOf(method) === -1) {
            throw new Error("'".concat(method, "' is not a valid hook method"));
          }
        });
        methods.forEach(function (method) {
          // @ts-ignore
          var myHooks = _this2.__hooks[type][method] || (_this2.__hooks[type][method] = []);

          if (hooks.all) {
            myHooks.push.apply(myHooks, hooks.all);
          }

          if (hooks[method]) {
            myHooks.push.apply(myHooks, hooks[method]);
          }
        });
      });
      return this;
    }
  });
}

exports.enableHooks = enableHooks;

/***/ }),

/***/ "../commons/lib/index.js":
/*!*******************************!*
  !*** ../commons/lib/index.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) {
    if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  }
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.hooks = void 0;

var hookUtils = __importStar(__webpack_require__(/*! ./hooks */ "../commons/lib/hooks.js"));

__exportStar(__webpack_require__(/*! ./utils */ "../commons/lib/utils.js"), exports);

exports.hooks = hookUtils;

/***/ }),

/***/ "../commons/lib/utils.js":
/*!*******************************!*
  !*** ../commons/lib/utils.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createSymbol = exports.makeUrl = exports.isPromise = exports._ = exports.stripSlashes = void 0; // Removes all leading and trailing slashes from a path

function stripSlashes(name) {
  return name.replace(/^(\/+)|(\/+)$/g, '');
}

exports.stripSlashes = stripSlashes; // A set of lodash-y utility functions that use ES6

exports._ = {
  each: function each(obj, callback) {
    if (obj && typeof obj.forEach === 'function') {
      obj.forEach(callback);
    } else if (exports._.isObject(obj)) {
      Object.keys(obj).forEach(function (key) {
        return callback(obj[key], key);
      });
    }
  },
  some: function some(value, callback) {
    return Object.keys(value).map(function (key) {
      return [value[key], key];
    }).some(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          val = _ref2[0],
          key = _ref2[1];

      return callback(val, key);
    });
  },
  every: function every(value, callback) {
    return Object.keys(value).map(function (key) {
      return [value[key], key];
    }).every(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          val = _ref4[0],
          key = _ref4[1];

      return callback(val, key);
    });
  },
  keys: function keys(obj) {
    return Object.keys(obj);
  },
  values: function values(obj) {
    return exports._.keys(obj).map(function (key) {
      return obj[key];
    });
  },
  isMatch: function isMatch(obj, item) {
    return exports._.keys(item).every(function (key) {
      return obj[key] === item[key];
    });
  },
  isEmpty: function isEmpty(obj) {
    return exports._.keys(obj).length === 0;
  },
  isObject: function isObject(item) {
    return _typeof(item) === 'object' && !Array.isArray(item) && item !== null;
  },
  isObjectOrArray: function isObjectOrArray(value) {
    return _typeof(value) === 'object' && value !== null;
  },
  extend: function extend(first) {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return Object.assign.apply(Object, [first].concat(rest));
  },
  omit: function omit(obj) {
    var result = exports._.extend({}, obj);

    for (var _len2 = arguments.length, keys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      keys[_key2 - 1] = arguments[_key2];
    }

    keys.forEach(function (key) {
      return delete result[key];
    });
    return result;
  },
  pick: function pick(source) {
    for (var _len3 = arguments.length, keys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      keys[_key3 - 1] = arguments[_key3];
    }

    return keys.reduce(function (result, key) {
      if (source[key] !== undefined) {
        result[key] = source[key];
      }

      return result;
    }, {});
  },
  // Recursively merge the source object into the target object
  merge: function merge(target, source) {
    if (exports._.isObject(target) && exports._.isObject(source)) {
      Object.keys(source).forEach(function (key) {
        if (exports._.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, _defineProperty({}, key, {}));
          }

          exports._.merge(target[key], source[key]);
        } else {
          Object.assign(target, _defineProperty({}, key, source[key]));
        }
      });
    }

    return target;
  }
}; // Duck-checks if an object looks like a promise

function isPromise(result) {
  return exports._.isObject(result) && typeof result.then === 'function';
}

exports.isPromise = isPromise;

function makeUrl(path) {
  var app = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var get = typeof app.get === 'function' ? app.get.bind(app) : function () {};
  var env = get('env') || "development";
  var host = get('host') || process.env.HOST_NAME || 'localhost';
  var protocol = env === 'development' || env === 'test' || env === undefined ? 'http' : 'https';
  var PORT = get('port') || process.env.PORT || 3030;
  var port = env === 'development' || env === 'test' || env === undefined ? ":".concat(PORT) : '';
  path = path || '';
  return "".concat(protocol, "://").concat(host).concat(port, "/").concat(exports.stripSlashes(path));
}

exports.makeUrl = makeUrl;

function createSymbol(name) {
  return typeof Symbol !== 'undefined' ? Symbol(name) : name;
}

exports.createSymbol = createSymbol;

/***/ }),

/***/ "../feathers/lib/application.js":
/*!**************************************!*
  !*** ../feathers/lib/application.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var debug = __webpack_require__(/*! debug */ "../../node_modules/debug/src/browser.js")('feathers:application');

var _require = __webpack_require__(/*! @feathersjs/commons */ "../commons/lib/index.js"),
    stripSlashes = _require.stripSlashes;

var Uberproto = __webpack_require__(/*! uberproto */ "../../node_modules/uberproto/lib/proto.js");

var events = __webpack_require__(/*! ./events */ "../feathers/lib/events.js");

var hooks = __webpack_require__(/*! ./hooks */ "../feathers/lib/hooks/index.js");

var version = __webpack_require__(/*! ./version */ "../feathers/lib/version.js");

var Proto = Uberproto.extend({
  create: null
});
var application = {
  init: function init() {
    Object.assign(this, {
      version: version,
      methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
      mixins: [],
      services: {},
      providers: [],
      _setup: false,
      settings: {}
    });
    this.configure(hooks());
    this.configure(events());
  },
  get: function get(name) {
    return this.settings[name];
  },
  set: function set(name, value) {
    this.settings[name] = value;
    return this;
  },
  disable: function disable(name) {
    this.settings[name] = false;
    return this;
  },
  disabled: function disabled(name) {
    return !this.settings[name];
  },
  enable: function enable(name) {
    this.settings[name] = true;
    return this;
  },
  enabled: function enabled(name) {
    return !!this.settings[name];
  },
  configure: function configure(fn) {
    fn.call(this, this);
    return this;
  },
  service: function service(path, _service) {
    if (typeof _service !== 'undefined') {
      throw new Error('Registering a new service with `app.service(path, service)` is no longer supported. Use `app.use(path, service)` instead.');
    }

    var location = stripSlashes(path) || '/';
    var current = this.services[location];

    if (typeof current === 'undefined' && typeof this.defaultService === 'function') {
      return this.use(location, this.defaultService(location)).service(location);
    }

    return current;
  },
  use: function use(path, service) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof path !== 'string') {
      throw new Error("'".concat(path, "' is not a valid service path."));
    }

    var location = stripSlashes(path) || '/';
    var isSubApp = typeof service.service === 'function' && service.services;
    var isService = this.methods.concat('setup').some(function (name) {
      return typeof service[name] === 'function';
    });

    if (isSubApp) {
      var subApp = service;
      Object.keys(subApp.services).forEach(function (subPath) {
        return _this.use("".concat(location, "/").concat(subPath), subApp.service(subPath));
      });
      return this;
    }

    if (!isService) {
      throw new Error("Invalid service object passed for path `".concat(location, "`"));
    } // If the service is already Uberproto'd use it directly


    var protoService = Proto.isPrototypeOf(service) ? service : Proto.extend(service);
    debug("Registering new service at `".concat(location, "`")); // Add all the mixins

    this.mixins.forEach(function (fn) {
      return fn.call(_this, protoService, location, options);
    });

    if (typeof protoService._setup === 'function') {
      protoService._setup(this, location);
    } // Run the provider functions to register the service


    this.providers.forEach(function (provider) {
      return provider.call(_this, protoService, location, options);
    }); // If we ran setup already, set this service up explicitly

    if (this._isSetup && typeof protoService.setup === 'function') {
      debug("Setting up service for `".concat(location, "`"));
      protoService.setup(this, location);
    }

    this.services[location] = protoService;
    return this;
  },
  setup: function setup() {
    var _this2 = this;

    // Setup each service (pass the app so that they can look up other services etc.)
    Object.keys(this.services).forEach(function (path) {
      var service = _this2.services[path];
      debug("Setting up service for `".concat(path, "`"));

      if (typeof service.setup === 'function') {
        service.setup(_this2, path);
      }
    });
    this._isSetup = true;
    return this;
  }
};
module.exports = application;

/***/ }),

/***/ "../feathers/lib/events.js":
/*!*********************************!*
  !*** ../feathers/lib/events.js ***!
  \*********************************/
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(/*! events */ "../../node_modules/events/events.js"),
    EventEmitter = _require.EventEmitter;

var Proto = __webpack_require__(/*! uberproto */ "../../node_modules/uberproto/lib/proto.js"); // Returns a hook that emits service events. Should always be
// used as the very last hook in the chain


var eventHook = exports.eventHook = function eventHook() {
  return function (hook) {
    var app = hook.app,
        service = hook.service;
    var eventName = hook.event === null ? hook.event : app.eventMappings[hook.method];
    var isHookEvent = service._hookEvents && service._hookEvents.indexOf(eventName) !== -1; // If this event is not being sent yet and we are not in an error hook

    if (eventName && isHookEvent && hook.type !== 'error') {
      var results = Array.isArray(hook.result) ? hook.result : [hook.result];
      results.forEach(function (element) {
        return service.emit(eventName, element, hook);
      });
    }
  };
}; // Mixin that turns a service into a Node event emitter


var eventMixin = exports.eventMixin = function eventMixin(service) {
  if (service._serviceEvents) {
    return;
  }

  var app = this; // Indicates if the service is already an event emitter

  var isEmitter = typeof service.on === 'function' && typeof service.emit === 'function'; // If not, mix it in (the service is always an Uberproto object that has a .mixin)

  if (typeof service.mixin === 'function' && !isEmitter) {
    service.mixin(EventEmitter.prototype);
  } // Define non-enumerable properties of


  Object.defineProperties(service, {
    // A list of all events that this service sends
    _serviceEvents: {
      value: Array.isArray(service.events) ? service.events.slice() : []
    },
    // A list of events that should be handled through the event hooks
    _hookEvents: {
      value: []
    }
  }); // `app.eventMappings` has the mapping from method name to event name

  Object.keys(app.eventMappings).forEach(function (method) {
    var event = app.eventMappings[method];
    var alreadyEmits = service._serviceEvents.indexOf(event) !== -1; // Add events for known methods to _serviceEvents and _hookEvents
    // if the service indicated it does not send it itself yet

    if (typeof service[method] === 'function' && !alreadyEmits) {
      service._serviceEvents.push(event);

      service._hookEvents.push(event);
    }
  });
};

module.exports = function () {
  return function (app) {
    // Mappings from service method to event name
    Object.assign(app, {
      eventMappings: {
        create: 'created',
        update: 'updated',
        remove: 'removed',
        patch: 'patched'
      }
    }); // Register the event hook
    // `finally` hooks always run last after `error` and `after` hooks

    app.hooks({
      finally: eventHook()
    }); // Make the app an event emitter

    Proto.mixin(EventEmitter.prototype, app);
    app.mixins.push(eventMixin);
  };
};

/***/ }),

/***/ "../feathers/lib/hooks/base.js":
/*!*************************************!*
  !*** ../feathers/lib/hooks/base.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _require = __webpack_require__(/*! @feathersjs/commons */ "../commons/lib/index.js"),
    _ = _require._;

var assignArguments = function assignArguments(context) {
  var service = context.service,
      method = context.method;
  var parameters = service.methods[method];
  context.arguments.forEach(function (value, index) {
    context[parameters[index]] = value;
  });

  if (!context.params) {
    context.params = {};
  }

  return context;
};

var validate = function validate(context) {
  var service = context.service,
      method = context.method,
      path = context.path;
  var parameters = service.methods[method];

  if (parameters.includes('id') && context.id === undefined) {
    throw new Error("An id must be provided to the '".concat(path, ".").concat(method, "' method"));
  }

  if (parameters.includes('data') && !_.isObjectOrArray(context.data)) {
    throw new Error("A data object must be provided to the '".concat(path, ".").concat(method, "' method"));
  }

  return context;
};

module.exports = [assignArguments, validate];

/***/ }),

/***/ "../feathers/lib/hooks/index.js":
/*!**************************************!*
  !*** ../feathers/lib/hooks/index.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = __webpack_require__(/*! @feathersjs/commons */ "../commons/lib/index.js"),
    hooks = _require.hooks,
    isPromise = _require.isPromise;

var baseHooks = __webpack_require__(/*! ./base */ "../feathers/lib/hooks/base.js");

var createHookObject = hooks.createHookObject,
    getHooks = hooks.getHooks,
    processHooks = hooks.processHooks,
    enableHooks = hooks.enableHooks,
    ACTIVATE_HOOKS = hooks.ACTIVATE_HOOKS;

var withHooks = function withHooks(_ref) {
  var app = _ref.app,
      service = _ref.service,
      method = _ref.method,
      original = _ref.original;
  return function () {
    var _hooks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var hooks = app.hookTypes.reduce(function (result, type) {
      var value = _hooks[type] || [];
      result[type] = Array.isArray(value) ? value : [value];
      return result;
    }, {});
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var returnHook = args[args.length - 1] === true ? args.pop() : false; // Create the hook object that gets passed through

      var hookObject = createHookObject(method, {
        type: 'before',
        // initial hook object type
        arguments: args,
        service: service,
        app: app
      });
      return Promise.resolve(hookObject) // Run `before` hooks
      .then(function (hookObject) {
        return processHooks.call(service, baseHooks.concat(hooks.before), hookObject);
      }) // Run the original method
      .then(function (hookObject) {
        // If `hookObject.result` is set, skip the original method
        if (typeof hookObject.result !== 'undefined') {
          return hookObject;
        } // Otherwise, call it with arguments created from the hook object


        var promise = new Promise(function (resolve) {
          var func = original || service[method];
          var args = service.methods[method].map(function (value) {
            return hookObject[value];
          });
          var result = func.apply(service, args);

          if (!isPromise(result)) {
            throw new Error("Service method '".concat(hookObject.method, "' for '").concat(hookObject.path, "' service must return a promise"));
          }

          resolve(result);
        });
        return promise.then(function (result) {
          hookObject.result = result;
          return hookObject;
        }).catch(function (error) {
          error.hook = hookObject;
          throw error;
        });
      }) // Run `after` hooks
      .then(function (hookObject) {
        var afterHookObject = Object.assign({}, hookObject, {
          type: 'after'
        });
        return processHooks.call(service, hooks.after, afterHookObject);
      }) // Run `errors` hooks
      .catch(function (error) {
        var errorHookObject = Object.assign({}, error.hook, {
          type: 'error',
          original: error.hook,
          error: error,
          result: undefined
        });
        return processHooks.call(service, hooks.error, errorHookObject).catch(function (error) {
          var errorHookObject = Object.assign({}, error.hook, {
            error: error,
            result: undefined
          });
          return errorHookObject;
        });
      }) // Run `finally` hooks
      .then(function (hookObject) {
        return processHooks.call(service, hooks.finally, hookObject).catch(function (error) {
          var errorHookObject = Object.assign({}, error.hook, {
            error: error,
            result: undefined
          });
          return errorHookObject;
        });
      }) // Resolve with a result or reject with an error
      .then(function (hookObject) {
        if (typeof hookObject.error !== 'undefined' && typeof hookObject.result === 'undefined') {
          return Promise.reject(returnHook ? hookObject : hookObject.error);
        } else {
          return returnHook ? hookObject : hookObject.result;
        }
      });
    };
  };
}; // A service mixin that adds `service.hooks()` method and functionality


var hookMixin = exports.hookMixin = function hookMixin(service) {
  if (typeof service.hooks === 'function') {
    return;
  }

  service.methods = Object.getOwnPropertyNames(service).filter(function (key) {
    return typeof service[key] === 'function' && service[key][ACTIVATE_HOOKS];
  }).reduce(function (result, methodName) {
    result[methodName] = service[methodName][ACTIVATE_HOOKS];
    return result;
  }, service.methods || {});
  Object.assign(service.methods, {
    find: ['params'],
    get: ['id', 'params'],
    create: ['data', 'params'],
    update: ['id', 'data', 'params'],
    patch: ['id', 'data', 'params'],
    remove: ['id', 'params']
  });
  var app = this;
  var methodNames = Object.keys(service.methods); // Assemble the mixin object that contains all "hooked" service methods

  var mixin = methodNames.reduce(function (mixin, method) {
    if (typeof service[method] !== 'function') {
      return mixin;
    }

    mixin[method] = function () {
      var service = this;
      var args = Array.from(arguments);

      var original = service._super.bind(service);

      return withHooks({
        app: app,
        service: service,
        method: method,
        original: original
      })({
        before: getHooks(app, service, 'before', method),
        after: getHooks(app, service, 'after', method, true),
        error: getHooks(app, service, 'error', method, true),
        finally: getHooks(app, service, 'finally', method, true)
      }).apply(void 0, _toConsumableArray(args));
    };

    return mixin;
  }, {}); // Add .hooks method and properties to the service

  enableHooks(service, methodNames, app.hookTypes);
  service.mixin(mixin);
};

module.exports = function () {
  return function (app) {
    // We store a reference of all supported hook types on the app
    // in case someone needs it
    Object.assign(app, {
      hookTypes: ['before', 'after', 'error', 'finally']
    }); // Add functionality for hooks to be registered as app.hooks

    enableHooks(app, app.methods, app.hookTypes);
    app.mixins.push(hookMixin);
  };
};

module.exports.withHooks = withHooks;
module.exports.ACTIVATE_HOOKS = ACTIVATE_HOOKS;

module.exports.activateHooks = function activateHooks(args) {
  return function (fn) {
    Object.defineProperty(fn, ACTIVATE_HOOKS, {
      value: args
    });
    return fn;
  };
};

/***/ }),

/***/ "../feathers/lib/index.js":
/*!********************************!*
  !*** ../feathers/lib/index.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var Proto = __webpack_require__(/*! uberproto */ "../../node_modules/uberproto/lib/proto.js");

var Application = __webpack_require__(/*! ./application */ "../feathers/lib/application.js");

var version = __webpack_require__(/*! ./version */ "../feathers/lib/version.js");

var _require = __webpack_require__(/*! ./hooks */ "../feathers/lib/hooks/index.js"),
    ACTIVATE_HOOKS = _require.ACTIVATE_HOOKS,
    activateHooks = _require.activateHooks; // A base object Prototype that does not inherit from a
// potentially polluted Object prototype


var baseObject = Object.create(null);

function createApplication() {
  var app = Object.create(baseObject); // Mix in the base application

  Proto.mixin(Application, app);
  app.init();
  return app;
}

createApplication.version = version;
createApplication.ACTIVATE_HOOKS = ACTIVATE_HOOKS;
createApplication.activateHooks = activateHooks;
module.exports = createApplication; // For better ES module (TypeScript) compatibility

module.exports.default = createApplication;

/***/ }),

/***/ "../feathers/lib/version.js":
/*!**********************************!*
  !*** ../feathers/lib/version.js ***!
  \**********************************/
/***/ (function(module) {

module.exports = '4.5.11';

/***/ }),

/***/ "../../node_modules/events/events.js":
/*!*******************************************!*
  !*** ../../node_modules/events/events.js ***!
  \*******************************************/
/***/ (function(module) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}


/***/ }),

/***/ "../../node_modules/ms/index.js":
/*!**************************************!*
  !*** ../../node_modules/ms/index.js ***!
  \**************************************/
/***/ (function(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "../../node_modules/uberproto/lib/proto.js":
/*!*************************************************!*
  !*** ../../node_modules/uberproto/lib/proto.js ***!
  \*************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* global define */
/**
 * Uberproto
 *
 * A base object for ECMAScript 5 style prototypal inheritance.
 *
 * @see https://github.com/rauschma/proto-js/
 * @see http://ejohn.org/blog/simple-javascript-inheritance/
 * @see http://uxebu.com/blog/2011/02/23/object-based-inheritance-for-ecmascript-5/
 */
(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function () {
  var HAS_SYMBOLS = typeof Object.getOwnPropertySymbols === 'function';

  function makeSuper (_super, old, name, fn) {
    var isFunction = typeof old === 'function';
    var newMethod = function () {
      var tmp = this._super;

      // Add a new ._super() method that is the same method
      // but either pointing to the prototype method
      // or to the overwritten method
      this._super = isFunction ? old : _super[name];

      // The method only need to be bound temporarily, so we
      // remove it when we're done executing
      var ret = fn.apply(this, arguments);

      this._super = tmp;

      return ret;
    };

    if (isFunction) {
      Object.keys(old).forEach(function (name) {
        newMethod[name] = old[name];
      });

      if (HAS_SYMBOLS) {
        Object.getOwnPropertySymbols(old).forEach(function (name) {
          newMethod[name] = old[name];
        });
      }
    }

    return newMethod;
  }

  return {
    /**
     * Create a new object using Object.create. The arguments will be
     * passed to the new instances init method or to a method name set in
     * __init.
     */
    create: function () {
      var instance = Object.create(this);
      var init = typeof instance.__init === 'string' ? instance.__init : 'init';

      if (typeof instance[init] === 'function') {
        instance[init].apply(instance, arguments);
      }
      return instance;
    },
    /**
     * Mixin a given set of properties
     * @param prop The properties to mix in
     * @param obj [optional]
     * The object to add the mixin
     */
    mixin: function (prop, obj) {
      var self = obj || this;
      var fnTest = /\b_super\b/;
      var _super = Object.getPrototypeOf(self) || self.prototype;
      var descriptors = {};
      var proto = prop;
      var processProperty = function (name) {
        var descriptor = Object.getOwnPropertyDescriptor(proto, name);

        if (!descriptors[name] && descriptor) {
          descriptors[name] = descriptor;
        }
      };

      // Collect all property descriptors
      do {
        Object.getOwnPropertyNames(proto).forEach(processProperty);

        if (HAS_SYMBOLS) {
          Object.getOwnPropertySymbols(proto).forEach(processProperty);
        }
      } while ((proto = Object.getPrototypeOf(proto)) && Object.getPrototypeOf(proto));

      var processDescriptor = function (name) {
        var descriptor = descriptors[name];

        if (typeof descriptor.value === 'function' && fnTest.test(descriptor.value)) {
          descriptor.value = makeSuper(_super, self[name], name, descriptor.value);
        }

        Object.defineProperty(self, name, descriptor);
      };

      Object.keys(descriptors).forEach(processDescriptor);

      if (HAS_SYMBOLS) {
        Object.getOwnPropertySymbols(descriptors).forEach(processDescriptor);
      }

      return self;
    },
    /**
     * Extend the current or a given object with the given property and return the extended object.
     * @param prop The properties to extend with
     * @param obj [optional] The object to extend from
     * @returns The extended object
     */
    extend: function (prop, obj) {
      return this.mixin(prop, Object.create(obj || this));
    },
    /**
     * Return a callback function with this set to the current or a given context object.
     * @param name Name of the method to proxy
     * @param args... [optional] Arguments to use for partial application
     */
    proxy: function (name) {
      var fn = this[name];
      var args = Array.prototype.slice.call(arguments, 1);

      args.unshift(this);
      return fn.bind.apply(fn, args);
    }
  };
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/core.js");
/******/ })()
;
});
//# sourceMappingURL=core.js.map