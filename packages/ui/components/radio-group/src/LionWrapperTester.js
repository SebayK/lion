import { html, LitElement } from 'lit';
import { ScopedElementsMixin } from '../../core/src/ScopedElementsMixin.js';
import { LionRadio, LionRadioGroup } from '../../../exports/radio-group.js';

export class LionWrapperTester extends ScopedElementsMixin(LitElement) {
  static get properties() {
    return {
      selectedOffer: { attribute: false },
      offers: { type: Array, attribute: false },
    };
  }

  static get scopedElements() {
    return {
      'lion-radio': LionRadio,
      'lion-radio-group': LionRadioGroup,
    };
  }

  constructor() {
    super();
    /** @type {string} */
    this.selectedOffer = '';
    /** @type {{ id: string; name: string }[]} */
    this.offers = [];
  }

  render() {
    console.log(this.selectedOffer);
    return html`
      <lion-radio-group
        .modelValue=${this.selectedOffer}
        @model-value-changed=${this.onModelValueChanged}
      >
        ${this.offers.map(
          (/** @type {{ id: string; name: string }} */ offer) =>
            html`<lion-radio label=${offer.name} .choiceValue=${offer.id}></lion-radio>`,
        )}
      </lion-radio-group>
    `;
  }

  /**
   * @param {CustomEvent & { target: { modelValue: string } }} e
   */
  onModelValueChanged(e) {
    this.selectedOffer = e.target.modelValue;
    this.dispatchEvent(
      new CustomEvent('selected-offer-changed', {
        detail: { value: this.selectedOffer },
      }),
    );
  }
}
