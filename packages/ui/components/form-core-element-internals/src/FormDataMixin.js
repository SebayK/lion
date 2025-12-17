import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { Unparseable } from './validate/Unparseable.js';

/**
 * @typedef {import('../types/FormControlMixinTypes.js').FormControlHost} FormControlHost
 */

/**
 * FormDataMixin - Provides native FormData integration via ElementInternals
 *
 * This mixin enables form controls to participate in native form submission
 * by implementing the formAssociated custom element lifecycle.
 *
 * Key responsibilities:
 * - Syncs modelValue to ElementInternals.setFormValue()
 * - Provides formDisabled, formReset callbacks
 * - Works with both single controls and form groups
 *
 * @param {import('@open-wc/dedupe-mixin').Constructor<import('lit').LitElement>} superclass
 */
const FormDataMixinImplementation = superclass =>
  // eslint-disable-next-line no-shadow
  class FormDataMixin extends superclass {
    static get formAssociated() {
      return true;
    }

    static get properties() {
      return {
        ...super.properties,
      };
    }

    constructor() {
      super();
      
      /**
       * @type {ElementInternals | undefined}
       * @protected
       */
      this._internals = undefined;
    }

    connectedCallback() {
      super.connectedCallback?.();
      
      // Initialize ElementInternals after element is constructed
      if (!this._internals) {
        this._internals = this.attachInternals();
      }
    }

    /**
     * Sync modelValue to native form data
     * Called whenever modelValue changes
     * @param {string} name
     * @param {*} oldValue
     * @protected
     */
    _onModelValueChanged({ name, oldValue }) {
      if (super._onModelValueChanged) {
        super._onModelValueChanged({ name, oldValue });
      }

      this._syncFormValue();
    }

    /**
     * Syncs current modelValue to ElementInternals
     * @protected
     */
    _syncFormValue() {
      if (!this._internals) return;

      const value = this.modelValue;
      
      // Handle Unparseable values - don't submit to form
      // The viewValue stays in the input field, but form data should be empty
      if (value instanceof Unparseable) {
        this._internals.setFormValue(null);
        return;
      }
      
      // Handle different value types
      if (value == null || value === '') {
        this._internals.setFormValue(null);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // For objects (like fieldsets), serialize to FormData
        const formData = new FormData();
        Object.entries(value).forEach(([key, val]) => {
          if (val != null && val !== '') {
            formData.append(key, String(val));
          }
        });
        this._internals.setFormValue(formData);
      } else if (Array.isArray(value)) {
        // For arrays (like checkbox-group), use FormData with multiple values
        const formData = new FormData();
        value.forEach(val => {
          if (val != null && val !== '') {
            formData.append(this.name, String(val));
          }
        });
        this._internals.setFormValue(formData);
      } else {
        // For primitives, use string value
        this._internals.setFormValue(String(value));
      }
    }

    /**
     * Called when the form is reset
     * @param {Event} ev
     */
    formResetCallback() {
      if (this.resetGroup) {
        this.resetGroup();
      } else if (this.reset) {
        this.reset();
      }
    }

    /**
     * Called when the form's disabled state changes
     * @param {boolean} disabled
     */
    formDisabledCallback(disabled) {
      this.disabled = disabled;
    }

    /**
     * Form state restore callback
     * @param {string | File | FormData} state
     * @param {string} _mode
     */
    formStateRestoreCallback(state, _mode) {
      // Restore modelValue from saved state
      if (state != null) {
        this.modelValue = state;
      }
    }
  };

/**
 * @type {FormDataMixin}
 */
export const FormDataMixin = dedupeMixin(FormDataMixinImplementation);
