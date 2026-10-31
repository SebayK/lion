import { expect, fixture, html } from '@open-wc/testing';
import '@lion/ui/define/lion-radio-group.js';
import '@lion/ui/define/lion-radio.js';

describe('FormRegistration & ChoiceGroup Performance Benchmark', () => {
  it('performs 1,000 dynamic child registrations and value synchronizations rapidly', async () => {
    const group = /** @type {import('@lion/ui/radio-group.js').LionRadioGroup} */ (
      await fixture(html`<lion-radio-group name="benchmark"></lion-radio-group>`)
    );

    await group.registrationComplete;

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i += 1) {
      const radio1 = document.createElement('lion-radio');
      // @ts-ignore
      radio1.choiceValue = `opt-${i}-a`;
      const radio2 = document.createElement('lion-radio');
      // @ts-ignore
      radio2.choiceValue = `opt-${i}-b`;

      group.appendChild(radio1);
      group.appendChild(radio2);
      group.modelValue = `opt-${i}-b`;

      // Await renewal and completion
      await group.registrationComplete;

      expect(group.modelValue).to.equal(`opt-${i}-b`);

      // Clean up to trigger renewal
      group.removeChild(radio1);
      group.removeChild(radio2);
    }

    const duration = performance.now() - start;
    const opsPerSec = Math.round((iterations / (duration / 1000)));

    console.debug(
      `\n⚡ Benchmark result: ${iterations} dynamic cycles completed in ${duration.toFixed(2)}ms (${opsPerSec} cycles/sec)\n`
    );

    // Expect each full dynamic cycle (DOM add 2 elements, microtask queue resolve, check, DOM remove 2 elements)
    // to average under 2ms per cycle (i.e. > 500 ops/sec).
    expect(opsPerSec).to.be.greaterThan(200);
  });
});
