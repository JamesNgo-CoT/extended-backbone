"use strict";

var _routes;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* global _ $ Backbone CotForm */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXTENDED BACKBONE COLLECTION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* exported ExtendedBackboneCollection */
var ExtendedBackboneCollection = Backbone.Collection.extend({
  parse: function parse(response, options) {
    return Backbone.Collection.prototype.parse.call(this, response && response.value ? response.value : response, options);
  },
  fetch: function fetch() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var thisQuery = _.result(this, 'query');

    var optionsQuery = options.query;

    if (thisQuery || optionsQuery) {
      if (typeof query === 'string') {
        thisQuery = thisQuery.split('&').reduce(function (accumulator, currentValue) {
          var _currentValue$split = currentValue.split('='),
              _currentValue$split2 = _slicedToArray(_currentValue$split, 2),
              name = _currentValue$split2[0],
              value = _currentValue$split2[1];

          accumulator[name] = value;
          return accumulator;
        }, {});
      }

      if (typeof optionsQuery === 'string') {
        optionsQuery = optionsQuery.split('&').reduce(function (accumulator, currentValue) {
          var _currentValue$split3 = currentValue.split('='),
              _currentValue$split4 = _slicedToArray(_currentValue$split3, 2),
              name = _currentValue$split4[0],
              value = _currentValue$split4[1];

          accumulator[name] = value;
          return accumulator;
        }, {});
      }

      var urlError = function urlError() {
        throw new Error('A "url" property or function must be specified');
      };

      var base = _.result(this, 'url') || urlError();
      var query = Object.assign({}, thisQuery, optionsQuery);
      query = Object.keys(query).map(function (key) {
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(query[key]));
      }).join('&');
      options.url = "".concat(base, "?").concat(query);
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
}); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXTENDED BACKBONE MODEL
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
}); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXTENDED BACKBONE ROUTER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* exported ExtendedBackboneRouter */

var ExtendedBackboneRouter = Backbone.Router.extend({
  defaultFragment: 'home',
  routes: (_routes = {}, _defineProperty(_routes, 'home', function home() {}), _defineProperty(_routes, '*default', 'routeDefault'), _routes),
  hasRouted: false,
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

          if (!_this.hasRouted) {
            _this.hasRouted = true;
          }

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
}); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORM BACKBONE VIEW
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* exported FormBackboneView */

var FormBackboneView = Backbone.View.extend({
  formDefinition: function formDefinition() {
    var _this2 = this;

    return {
      id: _.result(this, 'formId'),
      rootPath: _.result(this, 'rootPath'),
      sections: _.result(this, 'sections'),
      success: function success(event) {
        return _this2.success(event);
      },
      title: _.result(this, 'title'),
      useBinding: true
    };
  },
  success: function success(event) {
    event.preventDefault();
    this.removeErrors();
    this.trigger('success');
    return false;
  },
  formScript: function formScript() {
    this.$form.append('<p><button class="btn btn-primary btn-lg">Submit</button></p>');
  },
  render: function render() {
    this.$el.empty();
    var cotForm = new CotForm(this.formDefinition());
    cotForm.render({
      target: this.$el
    });
    cotForm.setModel(this.model);
    this.$form = $('form', this.$el).eq(0);
    this.formValidator = this.$form.data('formValidation');
    this.$title = $('h2', this.$form);
    this.$alert = $('<div role="alert"></div>');
    $('.panel:first', this.$form).before(this.$alert);
    this.$liveRegion = $('.js-aria-live.sr-only, .ui-helper-hidden-accessible').eq(0);
    this.formScript();
  },
  disableFields: function disableFields() {
    this.$disabledElements = this.$form.find('button, input, select, textarea').filter(':enabled:visible').prop('disabled', true);
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
    var _this3 = this;

    // Dont know why, but this doesnt work unless it's inside a set timeout.
    setTimeout(function () {
      _this3.formValidator.resetForm(false);
    }, 0);
    this.$alert.addClass('alert alert-danger');
    this.$alert.html(message);
  },
  removeErrors: function removeErrors() {
    this.$alert.removeClass('alert alert-danger');
    this.$alert.html('');
  },
  focus: function focus() {
    this.$title.focus();
  }
});