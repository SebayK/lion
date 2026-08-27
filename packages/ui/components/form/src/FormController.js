/**
 * @typedef {import('lit').ReactiveController} ReactiveController
 * @typedef {import('../types/FormControllerTypes.js').FormControllerConfig} FormControllerConfig
 * @typedef {import('../types/FormControllerTypes.js').FormControllerErrorAction} FormControllerErrorAction
 * @typedef {import('../types/FormControllerTypes.js').FormControllerHost} FormControllerHost
 * @typedef {import('../types/FormControllerTypes.js').FormControllerTrigger} FormControllerTrigger
 * @typedef {import('../types/FormControllerTypes.js').FormControlWithFeedback} FormControlWithFeedback
 * @implements {ReactiveController}
 */
export class FormController {
  /**
   * @param {FormControllerHost} host
   * @param {FormControllerConfig} [config]
   */
  constructor(host, config = {}) {
    this.host = host;
    this.host.addController(this);
    /** @type {FormControllerConfig} */
    const initialConfig = {
      trigger: 'submit',
      errorAction: 'focus',
      scrollIntoViewOptions: undefined,
      ...config,
    };
    this._config = initialConfig;
  }

  hostConnected() {
    this._config = { ...this._config };
  }

  /**
   * @returns {FormControllerConfig}
   */
  get config() {
    return this._config;
  }

  /**
   * @param {FormControllerConfig} config
   */
  setConfig(config) {
    this._config = {
      ...this._config,
      ...config,
    };
  }

  /**
   * Runs the configured trigger flow.
   */
  async execute() {
    if (this._config.trigger === 'submit') {
      this.submit();
      return;
    }
    await this.validate();
  }

  /**
   * Runs the submit flow on the host form.
   */
  submit() {
    this.host.submit();
  }

  /**
   * Runs the validate flow on the host form.
   */
  async validate() {
    await this.host.validate();
    this.handleValidationResult();
  }

  /**
   * Runs configured error handling for submit trigger.
   */
  handleSubmitted() {
    if (this._config.trigger !== 'submit') {
      return;
    }
    this.handleValidationResult();
  }

  /**
   * Handles focus/scroll when an error is present.
   */
  handleValidationResult() {
    if (!this.host.hasFeedbackFor?.includes('error')) {
      return;
    }

    const firstErroneousFormElement = this._findFirstErroneousFormElement(this.host);
    if (!firstErroneousFormElement) {
      return;
    }

    if (this._config.errorAction === 'scroll') {
      FormController._scrollToFormElement(
        firstErroneousFormElement,
        this._config.scrollIntoViewOptions,
      );
      return;
    }

    FormController._focusFormElement(firstErroneousFormElement);
  }

  /**
   * @param {FormControllerHost | FormControlWithFeedback} element
   * @returns {FormControlWithFeedback | undefined}
   */
  _findFirstErroneousFormElement(element) {
    if (!('formElements' in element) || !element.formElements.length) {
      return undefined;
    }

    const firstFormElWithError =
      element.formElements.find(child => child.hasFeedbackFor.includes('error')) ||
      element.formElements[0];

    if (!firstFormElWithError) {
      return undefined;
    }

    if (FormController._hasFocusableNode(firstFormElWithError)) {
      return firstFormElWithError;
    }

    return this._findFirstErroneousFormElement(firstFormElWithError);
  }

  /**
   * @param {FormControlWithFeedback} formElement
   * @returns {formElement is FormControlWithFeedback & {_focusableNode: HTMLElement}}
   */
  static _hasFocusableNode(formElement) {
    return !!formElement._focusableNode;
  }

  /**
   * @param {FormControlWithFeedback} formElement
   */
  static _focusFormElement(formElement) {
    if (FormController._hasFocusableNode(formElement)) {
      formElement._focusableNode.focus();
      return;
    }

    formElement.focus?.();
  }

  /**
   * @param {FormControlWithFeedback} formElement
   * @param {ScrollIntoViewOptions | undefined} scrollIntoViewOptions
   */
  static _scrollToFormElement(formElement, scrollIntoViewOptions) {
    if (FormController._hasFocusableNode(formElement)) {
      formElement._focusableNode.scrollIntoView(scrollIntoViewOptions);
      return;
    }

    formElement.scrollIntoView(scrollIntoViewOptions);
  }
}
