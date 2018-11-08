
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("jkroso~type@2.0.0", function (exports, module) {
const toString = {}.toString
const DomNode = typeof window != 'undefined'
  ? window.Node
  : Function // could be any function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

function type(x) {
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type == 'object') {
    // in case they have been polyfilled
    if (x instanceof Map) return 'map'
    if (x instanceof Set) return 'set'
    return 'object'
  }
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

const types = module.exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object Set]': 'set',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Map]': 'map',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

module.exports = type

});

require.register("jkroso~equals@2.0.0", function (exports, module) {
var type = require('@jkroso/type');


function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  const fnA = types[type(a)]
  const fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

const types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types['bit-array'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
const getEnumerableProperties = (object) => {
  const result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

});

require.register("component~type@v1.2.1", function (exports, module) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

});

require.register("jsedn", function (exports, module) {
module.exports = require("jsedn/lib/reader.js");
});

require.register("jsedn/lib/atoms.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var BigInt, Char, Discard, Keyword, Prim, StringObj, Symbol, bigInt, char, charMap, kw, memo, sym, type,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  type = require("jsedn/lib/type.js");

  memo = require("jsedn/lib/memo.js");

  Prim = (function() {

    function Prim(val) {
      var x;
      if (type(val) === "array") {
        this.val = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = val.length; _i < _len; _i++) {
            x = val[_i];
            if (!(x instanceof Discard)) {
              _results.push(x);
            }
          }
          return _results;
        })();
      } else {
        this.val = val;
      }
    }

    Prim.prototype.value = function() {
      return this.val;
    };

    Prim.prototype.toString = function() {
      return JSON.stringify(this.val);
    };

    return Prim;

  })();

  BigInt = (function(_super) {

    __extends(BigInt, _super);

    function BigInt() {
      return BigInt.__super__.constructor.apply(this, arguments);
    }

    BigInt.prototype.ednEncode = function() {
      return this.val;
    };

    BigInt.prototype.jsEncode = function() {
      return this.val;
    };

    BigInt.prototype.jsonEncode = function() {
      return {
        BigInt: this.val
      };
    };

    return BigInt;

  })(Prim);

  StringObj = (function(_super) {

    __extends(StringObj, _super);

    function StringObj() {
      return StringObj.__super__.constructor.apply(this, arguments);
    }

    StringObj.prototype.toString = function() {
      return this.val;
    };

    StringObj.prototype.is = function(test) {
      return this.val === test;
    };

    return StringObj;

  })(Prim);

  charMap = {
    newline: "\n",
    "return": "\r",
    space: " ",
    tab: "\t",
    formfeed: "\f"
  };

  Char = (function(_super) {

    __extends(Char, _super);

    Char.prototype.ednEncode = function() {
      return "\\" + this.val;
    };

    Char.prototype.jsEncode = function() {
      return charMap[this.val] || this.val;
    };

    Char.prototype.jsonEncode = function() {
      return {
        Char: this.val
      };
    };

    function Char(val) {
      if (charMap[val] || val.length === 1) {
        this.val = val;
      } else {
        throw "Char may only be newline, return, space, tab, formfeed or a single character - you gave [" + val + "]";
      }
    }

    return Char;

  })(StringObj);

  Discard = (function() {

    function Discard() {}

    return Discard;

  })();

  Symbol = (function(_super) {

    __extends(Symbol, _super);

    Symbol.prototype.validRegex = /[0-9A-Za-z.*+!\-_?$%&=:#/]+/;

    Symbol.prototype.invalidFirstChars = [":", "#", "/"];

    Symbol.prototype.valid = function(word) {
      var _ref, _ref1, _ref2;
      if (((_ref = word.match(this.validRegex)) != null ? _ref[0] : void 0) !== word) {
        throw "provided an invalid symbol " + word;
      }
      if (word.length === 1 && word[0] !== "/") {
        if (_ref1 = word[0], __indexOf.call(this.invalidFirstChars, _ref1) >= 0) {
          throw "Invalid first character in symbol " + word[0];
        }
      }
      if (((_ref2 = word[0]) === "-" || _ref2 === "+" || _ref2 === ".") && (word[1] != null) && word[1].match(/[0-9]/)) {
        throw "If first char is " + word[0] + " the second char can not be numeric. You had " + word[1];
      }
      if (word[0].match(/[0-9]/)) {
        throw "first character may not be numeric. You provided " + word[0];
      }
      return true;
    };

    function Symbol() {
      var args, parts;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          if (args[0] === "/") {
            this.ns = null;
            this.name = "/";
          } else {
            parts = args[0].split("/");
            if (parts.length === 1) {
              this.ns = null;
              this.name = parts[0];
              if (this.name === ":") {
                throw "can not have a symbol of only :";
              }
            } else if (parts.length === 2) {
              this.ns = parts[0];
              if (this.ns === "") {
                throw "can not have a slash at start of symbol";
              }
              if (this.ns === ":") {
                throw "can not have a namespace of :";
              }
              this.name = parts[1];
              if (this.name.length === 0) {
                throw "symbol may not end with a slash.";
              }
            } else {
              throw "Can not have more than 1 forward slash in a symbol";
            }
          }
          break;
        case 2:
          this.ns = args[0];
          this.name = args[1];
      }
      if (this.name.length === 0) {
        throw "Symbol can not be empty";
      }
      this.val = "" + (this.ns ? "" + this.ns + "/" : "") + this.name;
      this.valid(this.val);
    }

    Symbol.prototype.toString = function() {
      return this.val;
    };

    Symbol.prototype.ednEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsonEncode = function() {
      return {
        Symbol: this.val
      };
    };

    return Symbol;

  })(Prim);

  Keyword = (function(_super) {

    __extends(Keyword, _super);

    Keyword.prototype.invalidFirstChars = ["#", "/"];

    function Keyword() {
      Keyword.__super__.constructor.apply(this, arguments);
      if (this.val[0] !== ":") {
        throw "keyword must start with a :";
      }
      if ((this.val[1] != null) === "/") {
        throw "keyword can not have a slash with out a namespace";
      }
    }

    Keyword.prototype.jsonEncode = function() {
      return {
        Keyword: this.val
      };
    };

    return Keyword;

  })(Symbol);

  char = memo(Char);

  kw = memo(Keyword);

  sym = memo(Symbol);

  bigInt = memo(BigInt);

  module.exports = {
    Prim: Prim,
    Symbol: Symbol,
    Keyword: Keyword,
    StringObj: StringObj,
    Char: Char,
    Discard: Discard,
    BigInt: BigInt,
    char: char,
    kw: kw,
    sym: sym,
    bigInt: bigInt
  };

}).call(this);

});

require.register("jsedn/lib/atPath.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var kw;

  kw = require("jsedn/lib/atoms.js").kw;

  module.exports = function(obj, path) {
    var part, value, _i, _len;
    path = path.trim().replace(/[ ]{2,}/g, ' ').split(' ');
    value = obj;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      part = path[_i];
      if (part[0] === ":") {
        part = kw(part);
      }
      if (value.exists) {
        if (value.exists(part) != null) {
          value = value.at(part);
        } else {
          throw "Could not find " + part;
        }
      } else {
        throw "Not a composite object";
      }
    }
    return value;
  };

}).call(this);

});

require.register("jsedn/lib/collections.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var Iterable, List, Map, Pair, Prim, Set, Vector, encode, equals, type,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  type = require("jsedn/lib/type.js");

  equals = require("jkroso~equals@2.0.0");

  Prim = require("jsedn/lib/atoms.js").Prim;

  encode = require("jsedn/lib/encode.js").encode;

  Iterable = (function(_super) {

    __extends(Iterable, _super);

    function Iterable() {
      return Iterable.__super__.constructor.apply(this, arguments);
    }

    Iterable.prototype.hashId = function() {
      return this.ednEncode();
    };

    Iterable.prototype.ednEncode = function() {
      return (this.map(function(i) {
        return encode(i);
      })).val.join(" ");
    };

    Iterable.prototype.jsonEncode = function() {
      return this.map(function(i) {
        if (i.jsonEncode != null) {
          return i.jsonEncode();
        } else {
          return i;
        }
      });
    };

    Iterable.prototype.jsEncode = function() {
      return (this.map(function(i) {
        if ((i != null ? i.jsEncode : void 0) != null) {
          return i.jsEncode();
        } else {
          return i;
        }
      })).val;
    };

    Iterable.prototype.exists = function(index) {
      return this.val[index] != null;
    };

    Iterable.prototype.each = function(iter) {
      var i, _i, _len, _ref, _results;
      _ref = this.val;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(iter(i));
      }
      return _results;
    };

    Iterable.prototype.map = function(iter) {
      return this.each(iter);
    };

    Iterable.prototype.walk = function(iter) {
      return this.map(function(i) {
        if ((i.walk != null) && type(i.walk) === "function") {
          return i.walk(iter);
        } else {
          return iter(i);
        }
      });
    };

    Iterable.prototype.at = function(index) {
      if (this.exists(index)) {
        return this.val[index];
      }
    };

    Iterable.prototype.set = function(index, val) {
      this.val[index] = val;
      return this;
    };

    return Iterable;

  })(Prim);

  List = (function(_super) {

    __extends(List, _super);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.ednEncode = function() {
      return "(" + (List.__super__.ednEncode.call(this)) + ")";
    };

    List.prototype.jsonEncode = function() {
      return {
        List: List.__super__.jsonEncode.call(this)
      };
    };

    List.prototype.map = function(iter) {
      return new List(this.each(iter));
    };

    return List;

  })(Iterable);

  Vector = (function(_super) {

    __extends(Vector, _super);

    function Vector() {
      return Vector.__super__.constructor.apply(this, arguments);
    }

    Vector.prototype.ednEncode = function() {
      return "[" + (Vector.__super__.ednEncode.call(this)) + "]";
    };

    Vector.prototype.jsonEncode = function() {
      return {
        Vector: Vector.__super__.jsonEncode.call(this)
      };
    };

    Vector.prototype.map = function(iter) {
      return new Vector(this.each(iter));
    };

    return Vector;

  })(Iterable);

  Set = (function(_super) {

    __extends(Set, _super);

    Set.prototype.ednEncode = function() {
      return "\#{" + (Set.__super__.ednEncode.call(this)) + "}";
    };

    Set.prototype.jsonEncode = function() {
      return {
        Set: Set.__super__.jsonEncode.call(this)
      };
    };

    function Set(val) {
      var item, _i, _len;
      Set.__super__.constructor.call(this);
      this.val = [];
      for (_i = 0, _len = val.length; _i < _len; _i++) {
        item = val[_i];
        if (__indexOf.call(this.val, item) >= 0) {
          throw "set not distinct";
        } else {
          this.val.push(item);
        }
      }
    }

    Set.prototype.map = function(iter) {
      return new Set(this.each(iter));
    };

    return Set;

  })(Iterable);

  Pair = (function() {

    function Pair(key, val) {
      this.key = key;
      this.val = val;
    }

    return Pair;

  })();

  Map = (function() {

    Map.prototype.hashId = function() {
      return this.ednEncode();
    };

    Map.prototype.ednEncode = function() {
      var i;
      return "{" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.value();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(encode(i));
        }
        return _results;
      }).call(this)).join(" ")) + "}";
    };

    Map.prototype.jsonEncode = function() {
      var i;
      return {
        Map: (function() {
          var _i, _len, _ref, _results;
          _ref = this.value();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.jsonEncode != null ? i.jsonEncode() : i);
          }
          return _results;
        }).call(this)
      };
    };

    Map.prototype.jsEncode = function() {
      var hashId, i, k, result, _i, _len, _ref, _ref1;
      result = {};
      _ref = this.keys;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        k = _ref[i];
        hashId = (k != null ? k.hashId : void 0) != null ? k.hashId() : k;
        result[hashId] = ((_ref1 = this.vals[i]) != null ? _ref1.jsEncode : void 0) != null ? this.vals[i].jsEncode() : this.vals[i];
      }
      return result;
    };

    function Map(val) {
      var i, v, _i, _len, _ref;
      this.val = val != null ? val : [];
      if (this.val.length && this.val.length % 2 !== 0) {
        throw "Map accepts an array with an even number of items. You provided " + this.val.length + " items";
      }
      this.keys = [];
      this.vals = [];
      _ref = this.val;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        if (i % 2 === 0) {
          this.keys.push(v);
        } else {
          this.vals.push(v);
        }
      }
      this.val = false;
    }

    Map.prototype.value = function() {
      var i, result, v, _i, _len, _ref;
      result = [];
      _ref = this.keys;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        result.push(v);
        if (this.vals[i] !== void 0) {
          result.push(this.vals[i]);
        }
      }
      return result;
    };

    Map.prototype.indexOf = function(key) {
      var i, k, _i, _len, _ref;
      _ref = this.keys;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        k = _ref[i];
        if (equals(k, key)) {
          return i;
        }
      }
      return void 0;
    };

    Map.prototype.exists = function(key) {
      return this.indexOf(key) != null;
    };

    Map.prototype.at = function(key) {
      var id;
      if ((id = this.indexOf(key)) != null) {
        return this.vals[id];
      } else {
        throw "key does not exist";
      }
    };

    Map.prototype.set = function(key, val) {
      var id;
      if ((id = this.indexOf(key)) != null) {
        this.vals[id] = val;
      } else {
        this.keys.push(key);
        this.vals.push(val);
      }
      return this;
    };

    Map.prototype.each = function(iter) {
      var k, _i, _len, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        _results.push(iter(this.at(k), k));
      }
      return _results;
    };

    Map.prototype.map = function(iter) {
      var result;
      result = new Map;
      this.each(function(v, k) {
        var nv, _ref;
        nv = iter(v, k);
        if (nv instanceof Pair) {
          _ref = [nv.key, nv.val], k = _ref[0], nv = _ref[1];
        }
        return result.set(k, nv);
      });
      return result;
    };

    Map.prototype.walk = function(iter) {
      return this.map(function(v, k) {
        if (type(v.walk) === "function") {
          return iter(v.walk(iter), k);
        } else {
          return iter(v, k);
        }
      });
    };

    return Map;

  })();

  module.exports = {
    Iterable: Iterable,
    List: List,
    Vector: Vector,
    Set: Set,
    Pair: Pair,
    Map: Map
  };

}).call(this);

});

require.register("jsedn/lib/compile.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {

  module.exports = function(string) {
    return "return require('jsedn').parse(\"" + (string.replace(/"/g, '\\"').replace(/\n/g, " ").trim()) + "\")";
  };

}).call(this);

});

require.register("jsedn/lib/encode.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var encode, encodeHandlers, encodeJson, tokenHandlers, type;

  type = require("jsedn/lib/type.js");

  tokenHandlers = require("jsedn/lib/tokens.js").tokenHandlers;

  encodeHandlers = {
    array: {
      test: function(obj) {
        return type(obj) === "array";
      },
      action: function(obj) {
        var v;
        return "[" + (((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            v = obj[_i];
            _results.push(encode(v));
          }
          return _results;
        })()).join(" ")) + "]";
      }
    },
    integer: {
      test: function(obj) {
        return type(obj) === "number" && tokenHandlers.integer.pattern.test(obj);
      },
      action: function(obj) {
        return parseInt(obj);
      }
    },
    float: {
      test: function(obj) {
        return type(obj) === "number" && tokenHandlers.float.pattern.test(obj);
      },
      action: function(obj) {
        return parseFloat(obj);
      }
    },
    string: {
      test: function(obj) {
        return type(obj) === "string";
      },
      action: function(obj) {
        return "\"" + (obj.toString().replace(/"|\\/g, '\\$&')) + "\"";
      }
    },
    boolean: {
      test: function(obj) {
        return type(obj) === "boolean";
      },
      action: function(obj) {
        if (obj) {
          return "true";
        } else {
          return "false";
        }
      }
    },
    "null": {
      test: function(obj) {
        return type(obj) === "null";
      },
      action: function(obj) {
        return "nil";
      }
    },
    date: {
      test: function(obj) {
        return type(obj) === "date";
      },
      action: function(obj) {
        return "#inst \"" + (obj.toISOString()) + "\"";
      }
    },
    object: {
      test: function(obj) {
        return type(obj) === "object";
      },
      action: function(obj) {
        var k, result, v;
        result = [];
        for (k in obj) {
          v = obj[k];
          result.push(encode(k));
          result.push(encode(v));
        }
        return "{" + (result.join(" ")) + "}";
      }
    }
  };

  encode = function(obj) {
    var handler, name;
    if ((obj != null ? obj.ednEncode : void 0) != null) {
      return obj.ednEncode();
    }
    for (name in encodeHandlers) {
      handler = encodeHandlers[name];
      if (handler.test(obj)) {
        return handler.action(obj);
      }
    }
    throw "unhandled encoding for " + (JSON.stringify(obj));
  };

  encodeJson = function(obj, prettyPrint) {
    if (obj.jsonEncode != null) {
      return encodeJson(obj.jsonEncode(), prettyPrint);
    }
    if (prettyPrint) {
      return JSON.stringify(obj, null, 4);
    } else {
      return JSON.stringify(obj);
    }
  };

  module.exports = {
    encodeHandlers: encodeHandlers,
    encode: encode,
    encodeJson: encodeJson
  };

}).call(this);

});

require.register("jsedn/lib/memo.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var memo;

  module.exports = memo = function(klass) {
    memo[klass] = {};
    return function(val) {
      if (memo[klass][val] == null) {
        memo[klass][val] = new klass(val);
      }
      return memo[klass][val];
    };
  };

}).call(this);

});

require.register("jsedn/lib/reader.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var BigInt, Char, Discard, Iterable, Keyword, List, Map, Pair, Prim, Set, StringObj, Symbol, Tag, Tagged, Vector, bigInt, char, encode, encodeHandlers, encodeJson, escapeChar, fs, handleToken, kw, lex, parenTypes, parens, parse, read, specialChars, sym, tagActions, tokenHandlers, type, typeClasses, _ref, _ref1, _ref2, _ref3, _ref4,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  type = require("jsedn/lib/type.js");

  _ref = require("jsedn/lib/atoms.js"), Prim = _ref.Prim, Symbol = _ref.Symbol, Keyword = _ref.Keyword, StringObj = _ref.StringObj, Char = _ref.Char, Discard = _ref.Discard, BigInt = _ref.BigInt, char = _ref.char, kw = _ref.kw, sym = _ref.sym, bigInt = _ref.bigInt;

  _ref1 = require("jsedn/lib/collections.js"), Iterable = _ref1.Iterable, List = _ref1.List, Vector = _ref1.Vector, Set = _ref1.Set, Pair = _ref1.Pair, Map = _ref1.Map;

  _ref2 = require("jsedn/lib/tags.js"), Tag = _ref2.Tag, Tagged = _ref2.Tagged, tagActions = _ref2.tagActions;

  _ref3 = require("jsedn/lib/encode.js"), encodeHandlers = _ref3.encodeHandlers, encode = _ref3.encode, encodeJson = _ref3.encodeJson;

  _ref4 = require("jsedn/lib/tokens.js"), handleToken = _ref4.handleToken, tokenHandlers = _ref4.tokenHandlers;

  typeClasses = {
    Map: Map,
    List: List,
    Vector: Vector,
    Set: Set,
    Discard: Discard,
    Tag: Tag,
    Tagged: Tagged,
    StringObj: StringObj
  };

  parens = '()[]{}';

  specialChars = parens + ' \t\n\r,';

  escapeChar = '\\';

  parenTypes = {
    '(': {
      closing: ')',
      "class": "List"
    },
    '[': {
      closing: ']',
      "class": "Vector"
    },
    '{': {
      closing: '}',
      "class": "Map"
    }
  };

  lex = function(string) {
    var c, escaping, in_comment, in_string, line, lines, list, token, _i, _len;
    list = [];
    lines = [];
    line = 1;
    token = '';
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      c = string[_i];
      if (c === "\n" || c === "\r") {
        line++;
      }
      if ((typeof in_string === "undefined" || in_string === null) && c === ";" && (typeof escaping === "undefined" || escaping === null)) {
        in_comment = true;
      }
      if (in_comment) {
        if (c === "\n") {
          in_comment = void 0;
          if (token) {
            list.push(token);
            lines.push(line);
            token = '';
          }
        }
        continue;
      }
      if (c === '"' && (typeof escaping === "undefined" || escaping === null)) {
        if (typeof in_string !== "undefined" && in_string !== null) {
          list.push(new StringObj(in_string));
          lines.push(line);
          in_string = void 0;
        } else {
          in_string = '';
        }
        continue;
      }
      if (in_string != null) {
        if (c === escapeChar && (typeof escaping === "undefined" || escaping === null)) {
          escaping = true;
          continue;
        }
        if (escaping != null) {
          escaping = void 0;
          if (c === "t" || c === "n" || c === "f" || c === "r") {
            in_string += escapeChar;
          }
        }
        in_string += c;
      } else if (__indexOf.call(specialChars, c) >= 0 && (escaping == null)) {
        if (token) {
          list.push(token);
          lines.push(line);
          token = '';
        }
        if (__indexOf.call(parens, c) >= 0) {
          list.push(c);
          lines.push(line);
        }
      } else {
        if (escaping) {
          escaping = void 0;
        } else if (c === escapeChar) {
          escaping = true;
        }
        if (token === "#_") {
          list.push(token);
          lines.push(line);
          token = '';
        }
        token += c;
      }
    }
    if (token) {
      list.push(token);
      lines.push(line);
    }
    return {
      tokens: list,
      tokenLines: lines
    };
  };

  read = function(ast) {
    var read_ahead, result, token1, tokenLines, tokens;
    tokens = ast.tokens, tokenLines = ast.tokenLines;
    read_ahead = function(token, tokenIndex, expectSet) {
      var L, closeParen, handledToken, paren, tagged;
      if (tokenIndex == null) {
        tokenIndex = 0;
      }
      if (expectSet == null) {
        expectSet = false;
      }
      if (token === void 0) {
        return;
      }
      if ((!(token instanceof StringObj)) && (paren = parenTypes[token])) {
        closeParen = paren.closing;
        L = [];
        while (true) {
          token = tokens.shift();
          if (token === void 0) {
            throw "unexpected end of list at line " + tokenLines[tokenIndex];
          }
          tokenIndex++;
          if (token === paren.closing) {
            return new typeClasses[expectSet ? "Set" : paren["class"]](L);
          } else {
            L.push(read_ahead(token, tokenIndex));
          }
        }
      } else if (__indexOf.call(")]}", token) >= 0) {
        throw "unexpected " + token + " at line " + tokenLines[tokenIndex];
      } else {
        handledToken = handleToken(token);
        if (handledToken instanceof Tag) {
          token = tokens.shift();
          tokenIndex++;
          if (token === void 0) {
            throw "was expecting something to follow a tag at line " + tokenLines[tokenIndex];
          }
          tagged = new typeClasses.Tagged(handledToken, read_ahead(token, tokenIndex, handledToken.dn() === ""));
          if (handledToken.dn() === "") {
            if (tagged.obj() instanceof typeClasses.Set) {
              return tagged.obj();
            } else {
              throw "Exepected a set but did not get one at line " + tokenLines[tokenIndex];
            }
          }
          if (tagged.tag().dn() === "_") {
            return new typeClasses.Discard;
          }
          if (tagActions[tagged.tag().dn()] != null) {
            return tagActions[tagged.tag().dn()].action(tagged.obj());
          }
          return tagged;
        } else {
          return handledToken;
        }
      }
    };
    token1 = tokens.shift();
    if (token1 === void 0) {
      return void 0;
    } else {
      result = read_ahead(token1);
      if (result instanceof typeClasses.Discard) {
        return "";
      }
      return result;
    }
  };

  parse = function(string) {
    return read(lex(string));
  };

  module.exports = {
    Char: Char,
    char: char,
    Iterable: Iterable,
    Symbol: Symbol,
    sym: sym,
    Keyword: Keyword,
    kw: kw,
    BigInt: BigInt,
    bigInt: bigInt,
    List: List,
    Vector: Vector,
    Pair: Pair,
    Map: Map,
    Set: Set,
    Tag: Tag,
    Tagged: Tagged,
    setTypeClass: function(typeName, klass) {
      if (typeClasses[typeName] != null) {
        module.exports[typeName] = klass;
        return typeClasses[typeName] = klass;
      }
    },
    setTagAction: function(tag, action) {
      return tagActions[tag.dn()] = {
        tag: tag,
        action: action
      };
    },
    setTokenHandler: function(handler, pattern, action) {
      return tokenHandlers[handler] = {
        pattern: pattern,
        action: action
      };
    },
    setTokenPattern: function(handler, pattern) {
      return tokenHandlers[handler].pattern = pattern;
    },
    setTokenAction: function(handler, action) {
      return tokenHandlers[handler].action = action;
    },
    setEncodeHandler: function(handler, test, action) {
      return encodeHandlers[handler] = {
        test: test,
        action: action
      };
    },
    setEncodeTest: function(type, test) {
      return encodeHandlers[type].test = test;
    },
    setEncodeAction: function(type, action) {
      return encodeHandlers[type].action = action;
    },
    parse: parse,
    encode: encode,
    encodeJson: encodeJson,
    toJS: function(obj) {
      if ((obj != null ? obj.jsEncode : void 0) != null) {
        return obj.jsEncode();
      } else {
        return obj;
      }
    },
    atPath: require("jsedn/lib/atPath.js"),
    unify: require("jsedn/lib/unify.js")(parse),
    compile: require("jsedn/lib/compile.js")
  };

  if (typeof window === "undefined") {
    fs = require("fs");
    module.exports.readFile = function(file, cb) {
      return fs.readFile(file, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return cb(parse(data));
      });
    };
    module.exports.readFileSync = function(file) {
      return parse(fs.readFileSync(file, "utf-8"));
    };
  }

}).call(this);

});

require.register("jsedn/lib/tags.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var Prim, Tag, Tagged, tagActions, type,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Prim = require("jsedn/lib/atoms.js").Prim;

  type = require("jsedn/lib/type.js");

  Tag = (function() {

    function Tag() {
      var name, namespace, _ref;
      namespace = arguments[0], name = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.namespace = namespace;
      this.name = name;
      if (arguments.length === 1) {
        _ref = arguments[0].split('/'), this.namespace = _ref[0], this.name = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      }
    }

    Tag.prototype.ns = function() {
      return this.namespace;
    };

    Tag.prototype.dn = function() {
      return [this.namespace].concat(this.name).join('/');
    };

    return Tag;

  })();

  Tagged = (function(_super) {

    __extends(Tagged, _super);

    function Tagged(_tag, _obj) {
      this._tag = _tag;
      this._obj = _obj;
    }

    Tagged.prototype.jsEncode = function() {
      return {
        tag: this.tag().dn(),
        value: this.obj().jsEncode()
      };
    };

    Tagged.prototype.ednEncode = function() {
      return "\#" + (this.tag().dn()) + " " + (require("jsedn/lib/encode.js").encode(this.obj()));
    };

    Tagged.prototype.jsonEncode = function() {
      return {
        Tagged: [this.tag().dn(), this.obj().jsonEncode != null ? this.obj().jsonEncode() : this.obj()]
      };
    };

    Tagged.prototype.tag = function() {
      return this._tag;
    };

    Tagged.prototype.obj = function() {
      return this._obj;
    };

    Tagged.prototype.walk = function(iter) {
      return new Tagged(this._tag, type(this._obj.walk) === "function" ? this._obj.walk(iter) : iter(this._obj));
    };

    return Tagged;

  })(Prim);

  tagActions = {
    uuid: {
      tag: new Tag("uuid"),
      action: function(obj) {
        return obj;
      }
    },
    inst: {
      tag: new Tag("inst"),
      action: function(obj) {
        return new Date(Date.parse(obj));
      }
    }
  };

  module.exports = {
    Tag: Tag,
    Tagged: Tagged,
    tagActions: tagActions
  };

}).call(this);

});

require.register("jsedn/lib/tokens.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var Char, StringObj, Tag, bigInt, char, handleToken, kw, sym, tokenHandlers, _ref;

  _ref = require("jsedn/lib/atoms.js"), Char = _ref.Char, StringObj = _ref.StringObj, char = _ref.char, kw = _ref.kw, sym = _ref.sym, bigInt = _ref.bigInt;

  Tag = require("jsedn/lib/tags.js").Tag;

  handleToken = function(token) {
    var handler, name;
    if (token instanceof StringObj) {
      return token.toString();
    }
    for (name in tokenHandlers) {
      handler = tokenHandlers[name];
      if (handler.pattern.test(token)) {
        return handler.action(token);
      }
    }
    return sym(token);
  };

  tokenHandlers = {
    nil: {
      pattern: /^nil$/,
      action: function(token) {
        return null;
      }
    },
    boolean: {
      pattern: /^true$|^false$/,
      action: function(token) {
        return token === "true";
      }
    },
    keyword: {
      pattern: /^[\:].*$/,
      action: function(token) {
        return kw(token);
      }
    },
    char: {
      pattern: /^\\.*$/,
      action: function(token) {
        return char(token.slice(1));
      }
    },
    integer: {
      pattern: /^[\-\+]?[0-9]+N?$/,
      action: function(token) {
        if (/\d{15,}/.test(token)) {
          return bigInt(token);
        }
        return parseInt(token === "-0" ? "0" : token);
      }
    },
    float: {
      pattern: /^[\-\+]?[0-9]+(\.[0-9]*)?([eE][-+]?[0-9]+)?M?$/,
      action: function(token) {
        return parseFloat(token);
      }
    },
    tagged: {
      pattern: /^#.*$/,
      action: function(token) {
        return new Tag(token.slice(1));
      }
    }
  };

  module.exports = {
    handleToken: handleToken,
    tokenHandlers: tokenHandlers
  };

}).call(this);

});

require.register("jsedn/lib/type.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  module.exports = typeof module !== "undefined" && this.module !== module ? require("type-component") : require("component~type@v1.2.1");
}).call(this);

});

require.register("jsedn/lib/unify.js", function (exports, module) {
// Generated by CoffeeScript 1.6.1
(function() {
  var Map, Pair, Symbol, kw, sym, type, _ref, _ref1;

  type = require("jsedn/lib/type.js");

  _ref = require("jsedn/lib/collections.js"), Map = _ref.Map, Pair = _ref.Pair;

  _ref1 = require("jsedn/lib/atoms.js"), Symbol = _ref1.Symbol, kw = _ref1.kw, sym = _ref1.sym;

  module.exports = function(parse) {
    return function(data, values, tokenStart) {
      var unifyToken, valExists;
      if (tokenStart == null) {
        tokenStart = "?";
      }
      if (type(data) === "string") {
        data = parse(data);
      }
      if (type(values) === "string") {
        values = parse(values);
      }
      valExists = function(v) {
        if (values instanceof Map) {
          if (values.exists(v)) {
            return values.at(v);
          } else if (values.exists(sym(v))) {
            return values.at(sym(v));
          } else if (values.exists(kw(":" + v))) {
            return values.at(kw(":" + v));
          }
        } else {
          return values[v];
        }
      };
      unifyToken = function(t) {
        var val;
        if (t instanceof Symbol && ("" + t)[0] === tokenStart && ((val = valExists(("" + t).slice(1))) != null)) {
          return val;
        } else {
          return t;
        }
      };
      return data.walk(function(v, k) {
        if (k != null) {
          return new Pair(unifyToken(k), unifyToken(v));
        } else {
          return unifyToken(v);
        }
      });
    };
  };

}).call(this);

});

if (typeof exports == "object") {
  module.exports = require("jsedn");
} else if (typeof define == "function" && define.amd) {
  define("jsedn", [], function(){ return require("jsedn"); });
} else {
  (this || window)["jsedn"] = require("jsedn");
}
})()
