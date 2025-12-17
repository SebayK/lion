import {
  runInteractionStateMixinSuite,
  runFormatMixinSuite,
} from '@lion/ui/form-core-element-internals-test-suites.js';

import '@lion/ui/define/lion-input-date.js';

const tagString = 'lion-input-date';
describe('<lion-input-date> integrations', () => {
  runInteractionStateMixinSuite({
    tagString,
    allowedModelValueTypes: [Date],
  });

  runFormatMixinSuite({
    tagString,
    modelValueType: Date,
  });
});
