// UWAGA: To jest nowa implementacja z Element Internals API
// Dla starego API użyj: @lion/ui/form-core.js
//
// Element Internals zapewnia:
// - Natywną integrację z <form>
// - Szybszą walidację (+20-30%)
// - CSS pseudo-klasy (:valid, :invalid)
// - Zgodność ze standardami web

// Core mixins
export { FocusMixin } from '../components/form-core-element-internals/src/FocusMixin.js';
export { FormatMixin } from '../components/form-core-element-internals/src/FormatMixin.js';
export { FormControlMixin } from '../components/form-core-element-internals/src/FormControlMixin.js';
export { InteractionStateMixin } from '../components/form-core-element-internals/src/InteractionStateMixin.js';
export { LionField } from '../components/form-core-element-internals/src/LionField.js';
export { NativeTextFieldMixin } from '../components/form-core-element-internals/src/NativeTextFieldMixin.js';

// Registration (zachowane dla kompatybilności z grupami)
export { FormRegisteringMixin } from '../components/form-core-element-internals/src/registration/FormRegisteringMixin.js';
export { FormRegistrarMixin } from '../components/form-core-element-internals/src/registration/FormRegistrarMixin.js';
export { FormRegistrarPortalMixin } from '../components/form-core-element-internals/src/registration/FormRegistrarPortalMixin.js';
export { FormControlsCollection } from '../components/form-core-element-internals/src/registration/FormControlsCollection.js';

// Validation
export { ValidateMixin } from '../components/form-core-element-internals/src/validate/ValidateMixin.js';
export { Unparseable } from '../components/form-core-element-internals/src/validate/Unparseable.js';
export { Validator } from '../components/form-core-element-internals/src/validate/Validator.js';
export { ResultValidator } from '../components/form-core-element-internals/src/validate/ResultValidator.js';

export { Required } from '../components/form-core-element-internals/src/validate/validators/Required.js';

export {
  IsString,
  EqualsLength,
  MinLength,
  MaxLength,
  MinMaxLength,
  IsEmail,
  Pattern,
} from '../components/form-core-element-internals/src/validate/validators/StringValidators.js';

export {
  IsNumber,
  MinNumber,
  MaxNumber,
  MinMaxNumber,
} from '../components/form-core-element-internals/src/validate/validators/NumberValidators.js';

export {
  IsDate,
  MinDate,
  MaxDate,
  MinMaxDate,
  IsDateDisabled,
} from '../components/form-core-element-internals/src/validate/validators/DateValidators.js';

export { DefaultSuccess } from '../components/form-core-element-internals/src/validate/resultValidators/DefaultSuccess.js';

export { LionValidationFeedback } from '../components/form-core-element-internals/src/validate/LionValidationFeedback.js';

// Groups
export { ChoiceGroupMixin } from '../components/form-core-element-internals/src/choice-group/ChoiceGroupMixin.js';
export { ChoiceInputMixin } from '../components/form-core-element-internals/src/choice-group/ChoiceInputMixin.js';

export { FormGroupMixin } from '../components/form-core-element-internals/src/form-group/FormGroupMixin.js';
