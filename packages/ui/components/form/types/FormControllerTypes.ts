import { ReactiveControllerHost } from 'lit';
import { FormControl } from '../../form-core/types/form-group/FormGroupMixinTypes.js';
import { FormRegistrarHost } from '../../form-core/types/registration/FormRegistrarMixinTypes.js';
import { ValidateHost } from '../../form-core/types/validate/ValidateMixinTypes.js';

export type FormControllerTrigger = 'submit' | 'validate';
export type FormControllerErrorAction = 'focus' | 'scroll';

export interface FormControlWithFeedback extends FormControl {
  hasFeedbackFor: string[];
  _focusableNode?: HTMLElement;
  focus?(): void;
  scrollIntoView(options?: ScrollIntoViewOptions): void;
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
  hasFeedbackFor: string[];
  submit(): void;
  formElements: FormControlWithFeedback[];
}
