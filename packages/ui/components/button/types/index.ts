import { LionForm } from '../../form/src/LionForm.js';

export type FormElementTarget = HTMLFormElement | LionForm;

export interface FormAssociation {
  form?: string;
  formElement?: FormElementTarget;
}
