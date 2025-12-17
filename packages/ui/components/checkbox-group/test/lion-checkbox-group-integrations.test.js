import { runChoiceGroupMixinSuite } from '@lion/ui/form-core-element-internals-test-suites.js';
import '@lion/ui/define/lion-checkbox-group.js';

runChoiceGroupMixinSuite({
  parentTagString: 'lion-checkbox-group',
  childTagString: 'lion-checkbox',
  choiceType: 'multiple',
});
