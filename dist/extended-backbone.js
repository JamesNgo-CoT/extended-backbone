"use strict";

var _routes;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* global _ $ Backbone CotForm */

/* exported ExtendedBackboneCollection */
var ExtendedBackboneCollection = Backbone.Collection.extend({
  parse: function parse(response, options) {
    return Backbone.Collection.prototype.parse.call(this, response && response.value ? response.value : response, options);
  },
  fetch: function fetch() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var query = _.result(this, 'query');

    if (query || options.query) {
      var _query = Object.assign({}, _query, options.query);

      var urlError = function urlError() {
        throw new Error('A "url" property or function must be specified');
      };

      var base = _.result(this, 'url') || urlError();

      if (_typeof(_query) === 'object') {
        _query = Object.keys(_query).map(function (key) {
          return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(_query[key]));
        }).join('&');
      }

      options.url = "".concat(base, "?").concat(_query);
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});
/* exported ExtendedBackboneModel */

var ExtendedBackboneModel = Backbone.Model.extend({
  url: function url() {
    var urlError = function urlError() {
      throw new Error('A "url" property or function must be specified');
    };

    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();

    if (this.isNew()) {
      return base;
    }

    var id = this.get(this.idAttribute);
    return "".concat(base.replace(/\/$/, ''), "('").concat(encodeURIComponent(id), "')");
  },
  save: function save(key, val, options) {
    var attrs;

    if (key == null || _typeof(key) === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = options || {};

    if (!options.attrsInclusive) {
      attrs = Object.assign({}, this.attributes, attrs);
    }

    delete attrs['@odata.etag'];
    delete attrs['__CreatedOn'];
    delete attrs['__ModifiedOn'];
    delete attrs['__Owner'];
    options.data = JSON.stringify(attrs);
    return Backbone.Model.prototype.save.call(this, null, options);
  }
});
/* exported ExtendedBackboneRouter */

var ExtendedBackboneRouter = Backbone.Router.extend({
  defaultFragment: 'home',
  routes: (_routes = {}, _defineProperty(_routes, 'home', function home() {}), _defineProperty(_routes, '*default', 'routeDefault'), _routes),
  execute: function execute(callback, args, name) {
    var _this = this;

    var nextCleanup = function nextCleanup(cleanupFunction) {
      if (typeof cleanupFunction === 'function') {
        _this.cleanupFunction = cleanupFunction;
      }
    };

    var afterCleanup = function afterCleanup(cleanupFunctionReturnValue) {
      if (cleanupFunctionReturnValue !== false) {
        _this.cleanupFunction = null;

        if (typeof callback === 'function') {
          var cleanupFunction = callback.call.apply(callback, [_this].concat(_toConsumableArray(args)));

          if (cleanupFunction instanceof Promise) {
            cleanupFunction.then(function (finalCleanupFunction) {
              nextCleanup(finalCleanupFunction);
            });
          } else {
            nextCleanup(cleanupFunction);
          }
        }
      } else {
        if (_this.routeDefault) {
          _this.routeDefault();
        }
      }
    };

    var cleanupFunctionReturnValue;

    if (this.cleanupFunction) {
      cleanupFunctionReturnValue = this.cleanupFunction.call(this, name);
    }

    if (cleanupFunctionReturnValue instanceof Promise) {
      cleanupFunctionReturnValue.then(function (finalCleanupFunctionReturnValue) {
        afterCleanup(finalCleanupFunctionReturnValue);
      });
    } else {
      afterCleanup(cleanupFunctionReturnValue);
    }
  },
  route: function route(_route, name, callback) {
    var oldCallback;

    if (callback) {
      oldCallback = callback;
    } else if (name) {
      if (typeof name === 'function') {
        oldCallback = name;
      } else if (typeof name === 'string') {
        oldCallback = this[name];
      }
    }

    if (oldCallback && (!this.routeDefault || oldCallback !== this.routeDefault)) {
      var newCallback = function newCallback() {
        var _oldCallback;

        this.lastFragment = Backbone.history.getFragment();

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return (_oldCallback = oldCallback).call.apply(_oldCallback, [this].concat(args));
      };

      if (callback) {
        callback = newCallback;
      } else if (name) {
        if (typeof name === 'function') {
          name = newCallback;
        } else if (typeof name === 'string') {
          this[name] = newCallback;
        }
      }
    }

    return Backbone.Router.prototype.route.call(this, _route, name, callback);
  },
  routeDefault: function routeDefault() {
    if (this.lastFragment != null) {
      this.navigate(this.lastFragment, {
        trigger: false,
        replace: true
      });
    } else if (this.defaultFragment != null) {
      this.navigate(this.defaultFragment, {
        trigger: true
      });
    }
  }
});
/* exported FormBackboneView */

var FormBackboneView = Backbone.View.extend({
  formDefinition: function formDefinition() {
    var _this2 = this;

    return {
      id: _.result(this, 'formId'),
      rootPath: _.result(this, 'rootPath'),
      success: function success(event) {
        event.preventDefault();

        _this2.trigger('success');

        return false;
      },
      useBinding: true,
      sections: _.result(this, 'section')
    };
  },
  formScript: function formScript() {},
  render: function render() {
    this.$el.empty();
    var cotForm = new CotForm(this.formDefinition());
    cotForm.render({
      target: this.$el
    });
    cotForm.setModel(this.model);
    this.$form = $('form', this.$el).eq(0);
    this.formValidator = this.$form.data('formValidation');
    this.$liveRegion = $('.js-aria-live.sr-only, .ui-helper-hidden-accessible').eq(0);
    this.formScript();
  },
  disableFields: function disableFields() {
    this.$disabledElements = this.$form.find('button, input, select').filter(':enabled:visible').prop('disabled', true);
    this.$liveRegion.html('Form fields are disabled');
  },
  enableFields: function enableFields() {
    if (this.$disabledElements) {
      this.$disabledElements.prop('disabled', false);
      this.$disabledElements = null;
    }

    this.$liveRegion.html('Form fields are enabled');
  },
  showError: function showError(message) {
    this.$form.prepend("\n      <div role=\"alert\" class=\"alert alert-danger alert-dismissible\">\n        <button type=\"button\" data-dismiss=\"alert\" aria-label=\"Close\" class=\"close\">\n          <span aria-hidden=\"true\">\xD7</span>\n        </button>\n        <div>\n            <strong>".concat(message, "</strong>\n        </div>\n      </div>\n    "));
  }
});