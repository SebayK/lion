import {
  runFormGroupMixinSuite,
  runFormGroupMixinInputSuite,
} from '@lion/ui/form-core-element-internals-test-suites.js';

import '@lion/ui/define/lion-fieldset.js';

runFormGroupMixinSuite({ tagString: 'lion-fieldset' });
runFormGroupMixinInputSuite({ tagString: 'lion-fieldset' });
