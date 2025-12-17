import { LionFieldset } from '@lion/ui/fieldset.js';

/**
 * @typedef {import('../../form-core-element-internals/types/registration/FormRegistrarMixinTypes.js').FormRegistrarHost} FormRegistrarHost
 */

const throwFormNodeError = () => {
  throw new Error(
    'No form node found. Did you put a <form> element inside your custom-form element?',
  );
};

/**
 * LionForm: form wrapper providing extra features and integration with lion-field elements.
 *
 * @customElement lion-form
 */
export class LionForm extends LionFieldset {
  /** @type {any} */
  static get properties() {
    return {
      noValidate: { type: Boolean, attribute: 'novalidate', reflect: true },
    };
  }

  constructor() {
    super();
    /** @protected */
    this._submit = this._submit.bind(this);
    /** @protected */
    this._reset = this._reset.bind(this);
    /**
     * When true, form will not validate before submission.
     * Equivalent to native form's novalidate attribute.
     * @type {boolean}
     */
    this.noValidate = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.__registerEventsForLionForm();

    // @override LionFieldset: makes sure a11y is handled by ._formNode
    this.removeAttribute('role');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__teardownEventsForLionForm();
  }

  get _formNode() {
    return /** @type {HTMLFormElement} */ (this.querySelector('form'));
  }

  submit() {
    if (this._formNode) {
      // Firefox requires cancelable flag, otherwise we cannot preventDefault
      // Firefox still runs default handlers for untrusted events :\
      this._formNode.dispatchEvent(new Event('submit', { cancelable: true }));
    } else {
      throwFormNodeError();
    }
  }

  /**
   * Handles form submission.
   *
   * @param {Event} ev
   * @protected
   */
  _submit(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.submitGroup();

    // Collect form data using Element Internals (automatic!)
    const formData = new FormData(this._formNode);

    // Dispatch submit event with both FormData (Element Internals) and serializedValue (Lion custom)
    this.dispatchEvent(
      new CustomEvent('submit', {
        bubbles: true,
        detail: {
          formData, // Element Internals - native FormData
          serializedValue: this.serializedValue, // Lion custom - backward compatibility
        },
      }),
    );

    if (this.hasFeedbackFor?.includes('error')) {
      this._setFocusOnFirstErroneousFormElement(/** @type { * & FormRegistrarHost } */ (this));
    }
  }

  reset() {
    if (this._formNode) {
      this._formNode.reset();
    } else {
      throwFormNodeError();
    }
  }

  /**
   * @param {Event} ev
   * @protected
   */
  _reset(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.resetGroup();
    this.dispatchEvent(new Event('reset', { bubbles: true }));
  }

  /**
   * @param {FormRegistrarHost} element
   * @protected
   */
  _setFocusOnFirstErroneousFormElement(element) {
    const firstFormElWithError =
      element.formElements.find(child => child.hasFeedbackFor.includes('error')) ||
      element.formElements[0];

    if (firstFormElWithError._focusableNode) {
      firstFormElWithError._focusableNode.focus();
    } else {
      this._setFocusOnFirstErroneousFormElement(firstFormElWithError);
    }
  }

  /** @private */
  __registerEventsForLionForm() {
    this._formNode.addEventListener('submit', this._submit);
    this._formNode.addEventListener('reset', this._reset);
  }

  /** @private */
  __teardownEventsForLionForm() {
    this._formNode.removeEventListener('submit', this._submit);
    this._formNode.removeEventListener('reset', this._reset);
  }
}
