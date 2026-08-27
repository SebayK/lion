import { FormControlsCollection } from '../../form-core/src/registration/FormControlsCollection.js';
import { ReactiveControllerHost } from 'lit';
import { FormControl } from '../../form-core/types/form-group/FormGroupMixinTypes.js';
import { FormRegistrarHost } from '../../form-core/types/registration/FormRegistrarMixinTypes.js';
import { ValidateHost } from '../../form-core/types/validate/ValidateMixinTypes.js';

export type FormControllerTrigger = 'submit' | 'validate';
export type FormControllerErrorAction = 'focus' | 'scroll';

export interface FormControlWithFeedback extends FormControl {
  _focusableNode?: HTMLElement;
}

export interface FormControllerConfig {
  trigger?: FormControllerTrigger;
  errorAction?: FormControllerErrorAction;
  scrollIntoViewOptions?: ScrollIntoViewOptions;
}

export interface FormControllerHost
  extends ReactiveControllerHost,
    FormRegistrarHost,
    ValidateHost,
    HTMLElement {
  submit(): void;
  formElements: FormControlsCollection & { [x: string]: any };
}
