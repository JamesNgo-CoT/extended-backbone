/* global _ $ Backbone CotForm */

/* exported ExtendedBackboneCollection */
const ExtendedBackboneCollection = Backbone.Collection.extend({
  parse(response, options) {
    return Backbone.Collection.prototype.parse.call(this, response && response.value ? response.value : response, options);
  },

  fetch(options = {}) {
    let query =_.result(this, 'query');
    if (query || options.query) {
      let query = Object.assign({}, query, options.query);

      const urlError = function () {
        throw new Error('A "url" property or function must be specified');
      };
      const base = _.result(this, 'url') || urlError();

      if (typeof query === 'object') {
        query = Object.keys(query).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
      }
      options.url = `${base}?${query}`;
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

/* exported ExtendedBackboneModel */
const ExtendedBackboneModel = Backbone.Model.extend({
  url() {
    const urlError = function () {
      throw new Error('A "url" property or function must be specified');
    };

    const base =
      _.result(this, 'urlRoot') ||
      _.result(this.collection, 'url') ||
      urlError();

    if (this.isNew()) {
      return base;
    }

    var id = this.get(this.idAttribute);
    return `${base.replace(/\/$/, '')}('${encodeURIComponent(id)}')`;
  },

  save(key, val, options) {
    let attrs;
    if (key == null || typeof key === 'object') {
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
const ExtendedBackboneRouter = Backbone.Router.extend({
  defaultFragment: 'home',

  routes: {
    ['home']() { },
    '*default': 'routeDefault'
  },

  execute(callback, args, name) {
    const nextCleanup = (cleanupFunction) => {
      if (typeof cleanupFunction === 'function') {
        this.cleanupFunction = cleanupFunction;
      }
    };

    const afterCleanup = (cleanupFunctionReturnValue) => {
      if (cleanupFunctionReturnValue !== false) {
        this.cleanupFunction = null;

        if (typeof callback === 'function') {
          const cleanupFunction = callback.call(this, ...args);
          if (cleanupFunction instanceof Promise) {
            cleanupFunction.then((finalCleanupFunction) => {
              nextCleanup(finalCleanupFunction);
            });
          } else {
            nextCleanup(cleanupFunction);
          }
        }
      } else {
        if (this.routeDefault) {
          this.routeDefault();
        }
      }
    };

    let cleanupFunctionReturnValue;
    if (this.cleanupFunction) {
      cleanupFunctionReturnValue = this.cleanupFunction.call(this, name);
    }

    if (cleanupFunctionReturnValue instanceof Promise) {
      cleanupFunctionReturnValue.then((finalCleanupFunctionReturnValue) => {
        afterCleanup(finalCleanupFunctionReturnValue);
      });
    } else {
      afterCleanup(cleanupFunctionReturnValue);
    }
  },

  route(route, name, callback) {
    let oldCallback;
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
      const newCallback = function (...args) {
        this.lastFragment = Backbone.history.getFragment();
        return oldCallback.call(this, ...args);
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

    return Backbone.Router.prototype.route.call(this, route, name, callback);
  },

  routeDefault() {
    if (this.lastFragment != null) {
      this.navigate(this.lastFragment, { trigger: false, replace: true });
    } else if (this.defaultFragment != null) {
      this.navigate(this.defaultFragment, { trigger: true });
    }
  }
});

/* exported FormBackboneView */
const FormBackboneView = Backbone.View.extend({
  formDefinition() {
    return {
      id: _.result(this, 'formId'),
      rootPath: _.result(this, 'rootPath'),
      success: (event) => {
        event.preventDefault();
        this.trigger('success');
        return false;
      },
      useBinding: true,
      sections: _.result(this, 'section')
    };
  },

  formScript() {},

  render() {
    this.$el.empty();

    const cotForm = new CotForm(this.formDefinition());
    cotForm.render({ target: this.$el });
    cotForm.setModel(this.model);

    this.$form = $('form', this.$el).eq(0);
    this.formValidator = this.$form.data('formValidation');

    this.$liveRegion = $('.js-aria-live.sr-only, .ui-helper-hidden-accessible').eq(0);

    this.formScript();
  },

  disableFields() {
    this.$disabledElements = this.$form.find('button, input, select').filter(':enabled:visible').prop('disabled', true);
    this.$liveRegion.html('Form fields are disabled');
  },

  enableFields() {
    if (this.$disabledElements) {
      this.$disabledElements.prop('disabled', false);
      this.$disabledElements = null;
    }
    this.$liveRegion.html('Form fields are enabled');
  },

  showError(message) {
    this.$form.prepend(`
      <div role="alert" class="alert alert-danger alert-dismissible">
        <button type="button" data-dismiss="alert" aria-label="Close" class="close">
          <span aria-hidden="true">×</span>
        </button>
        <div>
            <strong>${message}</strong>
        </div>
      </div>
    `);
  }
});