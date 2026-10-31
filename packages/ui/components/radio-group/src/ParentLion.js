import { html, LitElement } from 'lit';
import { ScopedElementsMixin } from '../../core/src/ScopedElementsMixin.js';
import { LionWrapperTester } from './LionWrapperTester.js';

export class ParentLion extends ScopedElementsMixin(LitElement) {
  static get properties() {
    return {
      selectedOffer: { attribute: false },
    };
  }

  static get scopedElements() {
    return {
      'lion-wrapper-tester': LionWrapperTester,
    };
  }

  constructor() {
    super();
    /** @type {string} */
    this.selectedOffer = '';
    /** @type {{ id: string; name: string }[]} */
    this.offers = [];
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this.offers = [
        { id: 'offer1', name: 'offer1' },
        { id: 'offer2', name: 'offer2' },
      ];
      this.selectedOffer = 'offer2';
    }, 1000);
  }

  render() {
    return html`
      <lion-wrapper-tester
        .offers=${this.offers}
        .selectedOffer=${this.selectedOffer}
        @selected-offer-changed=${this.onSelectedOfferChanged}
      >
      </lion-wrapper-tester>
    `;
  }

  /**
   * @param {CustomEvent<{ value: string }>} e
   */
  onSelectedOfferChanged(e) {
    this.selectedOffer = e.detail.value;
  }
}
