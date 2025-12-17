# Element Internals - Plan Implementacji i Migracji

**Data utworzenia**: 2025-12-16  
**Status**: Draft - Gotowy do realizacji  
**Powiązane dokumenty**:

- `element-internals-migration-plan.md` (zakończony - fazy 1-4)
- `element-internals-cleanup-plan.md` (plan długoterminowy)

---

## Executive Summary

Implementacja Element Internals została zakończona w `form-core-element-internals`. Ten dokument zawiera:

1. **Analizę testów jednostkowych** - czy wymagają dostosowania
2. **Plan migracji komponentów** - krok po kroku z zachowaniem logiki
3. **Harmonogram realizacji** z konkretnymi zadaniami

### Kluczowe ustalenia:

✅ **Testy są już kompatybilne** - używają test suites które abstrahują implementację  
✅ **Komponenty dziedziczą z LionField** - zmiana importu wystarczy w większości przypadków  
⚠️ **Należy zachować backward compatibility** - dual mode przez okres przejściowy

---

## Część 1: Analiza Testów Jednostkowych

### 1.1 Struktura Testów w form-core-element-internals

```
/form-core-element-internals/
├── test/                          # Testy jednostkowe
│   ├── lion-field.test.js
│   ├── FocusMixin.test.js
│   ├── FormatMixin.test.js
│   ├── ValidateMixin.test.js
│   ├── InteractionStateMixin.test.js
│   ├── FormRegistrationMixins.test.js
│   ├── NativeTextFieldMixin.test.js
│   ├── FormControlMixin.test.js
│   ├── validate/
│   │   ├── ValidateMixin.test.js
│   │   ├── ValidateMixinFeedbackPart.test.js
│   │   ├── Validator.test.js
│   │   ├── Required.test.js
│   │   ├── StringValidators.test.js
│   │   ├── NumberValidators.test.js
│   │   └── DateValidators.test.js
│   ├── form-group/
│   │   └── FormGroupMixin.test.js
│   └── choice-group/
│       ├── ChoiceInputMixin.test.js
│       └── CustomChoiceGroupMixin.test.js
│
└── test-suites/                   # Reusable test suites
    ├── ValidateMixin.suite.js     (~1630 linii)
    ├── FormatMixin.suite.js       (~774 linii)
    ├── ValidateMixinFeedbackPart.suite.js (~773 linii)
    ├── InteractionStateMixin.suite.js (~276 linii)
    ├── FormRegistrationMixins.suite.js (~460 linii)
    ├── NativeTextFieldMixin.suite.js (~75 linii)
    ├── form-group/
    │   ├── FormGroupMixin.suite.js
    │   └── FormGroupMixin-input.suite.js
    └── choice-group/
        ├── ChoiceInputMixin.suite.js
        └── CustomChoiceGroupMixin.suite.js
```

### 1.2 Porównanie z form-core

**Identyczne rozmiary test suites:**

```
ValidateMixin.suite.js:        1630 linii (identyczne)
FormatMixin.suite.js:          774 linii (identyczne)
ValidateMixinFeedbackPart.suite.js: 773 linii (identyczne)
InteractionStateMixin.suite.js: 276 linii (identyczne)
```

**Wniosek**: Testy zostały skopiowane 1:1 z `form-core` do `form-core-element-internals`

### 1.3 Czy testy wymagają dostosowania?

#### ✅ NIE wymagają - Test Suites są uniwersalne

**Powód**: Test suites używają wzorca "behavioral testing":

```javascript
// Test suite definiuje zachowanie, nie implementację
export function runValidateMixinSuite(customConfig) {
  describe('ValidateMixin', () => {
    it('validates on initialization', async () => {
      const el = await fixture(html`<${tag} .validators=${[new Required()]}></${tag}>`);
      expect(el.hasFeedbackFor).to.deep.equal(['error']);
    });
  });
}
```

**Testowane API publiczne (niezmienione)**:

- `hasFeedbackFor` - nadal istnieje
- `showsFeedbackFor` - nadal istnieje
- `validators` - nadal istnieje
- `validationStates` - nadal istnieje
- `validate()` - nadal istnieje
- `modelValue`, `formattedValue`, `serializedValue` - nadal istnieją

**Nowe API (wewnętrzne, niewidoczne w testach)**:

- `this._internals.setValidity()` - wywoływane wewnątrz `validate()`
- `this._internals.setFormValue()` - wywoływane wewnątrz `_calculateValues()`

#### ⚠️ MOGĄ wymagać - Testy specyficzne dla Element Internals

**Brakujące testy dla**:

1. Natywna integracja z `<form>` element
2. Sprawdzenie `form.elements` zawiera komponenty
3. Weryfikacja `setValidity()` ustawia prawidłowe flagi
4. Sprawdzenie `setFormValue()` z różnymi typami wartości
5. Testy CSS pseudo-klas (`:valid`, `:invalid`)

### 1.4 Rekomendacje dla testów

#### Faza 1: Dodać testy Element Internals API (2-3 dni)

**Plik**: `/form-core-element-internals/test/ElementInternalsIntegration.test.js` (NOWY)

```javascript
import { fixture, expect, html } from '@open-wc/testing';
import { Required } from '@lion/ui/form-core.js';
import '@lion/ui/define/lion-field.js';

describe('Element Internals Integration', () => {
  describe('Form Association', () => {
    it('attaches ElementInternals on construction', async () => {
      const el = await fixture(html`<lion-field name="test"><input slot="input" /></lion-field>`);
      expect(el._internals).to.exist;
      expect(el._internals.form).to.be.null; // nie w formularzu
    });

    it('associates with parent <form>', async () => {
      const form = await fixture(html`
        <form>
          <lion-field name="username"><input slot="input" /></lion-field>
        </form>
      `);
      const field = form.querySelector('lion-field');

      expect(field._internals.form).to.equal(form);
      expect(form.elements.namedItem('username')).to.equal(field);
    });

    it('submits value with form', async () => {
      const form = await fixture(html`
        <form>
          <lion-field name="email" .modelValue=${'test@example.com'}>
            <input slot="input" />
          </lion-field>
        </form>
      `);

      const formData = new FormData(form);
      expect(formData.get('email')).to.equal('test@example.com');
    });
  });

  describe('Validity State', () => {
    it('sets validity flags via setValidity()', async () => {
      const el = await fixture(html`
        <lion-field .validators=${[new Required()]}>
          <input slot="input" />
        </lion-field>
      `);

      await el.validate();

      // Element Internals validity
      expect(el._internals.validity.valueMissing).to.be.true;
      expect(el._internals.validity.valid).to.be.false;

      // Public API (zachowane dla kompatybilności)
      expect(el.hasFeedbackFor).to.include('error');
    });

    it('clears validity when valid', async () => {
      const el = await fixture(html`
        <lion-field .validators=${[new Required()]} .modelValue=${'value'}>
          <input slot="input" />
        </lion-field>
      `);

      await el.validate();

      expect(el._internals.validity.valid).to.be.true;
      expect(el.hasFeedbackFor).to.not.include('error');
    });

    it('provides validation message via validationMessage', async () => {
      const el = await fixture(html`
        <lion-field .validators=${[new Required()]}>
          <input slot="input" />
        </lion-field>
      `);

      await el.validate();

      expect(el._internals.validationMessage).to.not.be.empty;
    });
  });

  describe('CSS Pseudo-classes', () => {
    it('applies :invalid when field has errors', async () => {
      const el = await fixture(html`
        <lion-field .validators=${[new Required()]}>
          <input slot="input" />
        </lion-field>
      `);

      await el.validate();

      // Pseudo-klasy są dostępne natywnie
      expect(el.matches(':invalid')).to.be.true;
      expect(el.matches(':valid')).to.be.false;
    });

    it('applies :valid when field is valid', async () => {
      const el = await fixture(html`
        <lion-field .modelValue=${'value'}>
          <input slot="input" />
        </lion-field>
      `);

      expect(el.matches(':valid')).to.be.true;
      expect(el.matches(':invalid')).to.be.false;
    });
  });

  describe('Form Value Types', () => {
    it('sets simple string value', async () => {
      const el = await fixture(html`
        <lion-field name="text" .modelValue=${'hello'}>
          <input slot="input" />
        </lion-field>
      `);

      // FormData używa _internals.setFormValue()
      const form = document.createElement('form');
      form.appendChild(el);
      const formData = new FormData(form);

      expect(formData.get('text')).to.equal('hello');
    });

    it('sets FormData for complex values', async () => {
      // Element Internals pozwala na FormData dla złożonych wartości
      // To może być wykorzystane w przyszłości dla file inputs, etc.
    });
  });

  describe('Form Reset', () => {
    it('resets to initial value on form.reset()', async () => {
      const form = await fixture(html`
        <form>
          <lion-field name="field" .modelValue=${'initial'}>
            <input slot="input" />
          </lion-field>
        </form>
      `);
      const field = form.querySelector('lion-field');

      field.modelValue = 'changed';
      expect(field.modelValue).to.equal('changed');

      form.reset();

      // Element Internals automatycznie resetuje wartość
      // ale musimy też zresetować modelValue w naszym kodzie
      expect(field.modelValue).to.equal('initial');
    });
  });
});
```

#### Faza 2: Dodać testy dla mapowania ValidityStateFlags (1 dzień)

**Plik**: `/form-core-element-internals/test/ValidityStateMapping.test.js` (NOWY)

```javascript
import { fixture, expect, html } from '@open-wc/testing';
import {
  Required,
  MinLength,
  MaxLength,
  Pattern,
  IsEmail,
  MinNumber,
  MaxNumber,
} from '@lion/ui/form-core.js';
import '@lion/ui/define/lion-field.js';

describe('ValidityState Mapping', () => {
  it('maps Required to valueMissing', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new Required()]}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.valueMissing).to.be.true;
  });

  it('maps MinLength to tooShort', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new MinLength(5)]} .modelValue=${'ab'}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.tooShort).to.be.true;
  });

  it('maps MaxLength to tooLong', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new MaxLength(5)]} .modelValue=${'abcdefgh'}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.tooLong).to.be.true;
  });

  it('maps Pattern to patternMismatch', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new Pattern(/^[A-Z]+$/)]} .modelValue=${'abc123'}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.patternMismatch).to.be.true;
  });

  it('maps IsEmail to typeMismatch', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new IsEmail()]} .modelValue=${'not-an-email'}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.typeMismatch).to.be.true;
  });

  it('maps MinNumber to rangeUnderflow', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new MinNumber(10)]} .modelValue=${5}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.rangeUnderflow).to.be.true;
  });

  it('maps MaxNumber to rangeOverflow', async () => {
    const el = await fixture(html`
      <lion-field .validators=${[new MaxNumber(10)]} .modelValue=${15}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.rangeOverflow).to.be.true;
  });

  it('maps custom validators to customError', async () => {
    class CustomValidator extends Validator {
      execute(value) {
        return value !== 'valid';
      }
    }

    const el = await fixture(html`
      <lion-field .validators=${[new CustomValidator()]} .modelValue=${'invalid'}>
        <input slot="input" />
      </lion-field>
    `);

    await el.validate();
    expect(el._internals.validity.customError).to.be.true;
  });
});
```

#### Faza 3: Zaktualizować dokumentację testów (1 dzień)

**Plik**: `/form-core-element-internals/test/README.md` (NOWY)

````markdown
# Form Core Element Internals - Testy

## Struktura

### Test Suites (`/test-suites`)

Reusable test suites dla mixinów - używane przez wszystkie komponenty.

- **ValidateMixin.suite.js** - pełny test walidacji
- **FormatMixin.suite.js** - formatowanie i parsowanie
- **InteractionStateMixin.suite.js** - touched, dirty states
- **FormRegistrationMixins.suite.js** - rejestracja w grupach

### Unit Tests (`/test`)

Testy specyficzne dla implementacji form-core-element-internals.

- **ElementInternalsIntegration.test.js** - testy integracji z Form API
- **ValidityStateMapping.test.js** - testy mapowania validatorów

## Różnice z form-core

### Co jest takie samo:

- Publiczne API (hasFeedbackFor, validators, modelValue, etc.)
- Wszystkie test suites
- Behavior testów

### Co jest nowe:

- Element Internals integration
- Natywna walidacja przez setValidity()
- Natywne wartości formularza przez setFormValue()
- CSS pseudo-klasy :valid/:invalid

## Uruchamianie testów

```bash
# Wszystkie testy
npm test

# Tylko form-core-element-internals
npm test -- --group form-core-element-internals

# Konkretny test
npm test -- --grep "Element Internals"
```
````

````

---

## Część 2: Plan Migracji Komponentów

### 2.1 Inwentaryzacja Komponentów

#### Komponenty bazowe (dziedziczą bezpośrednio z form-core):

| Komponent | Plik | Import z form-core | Priorytet |
|-----------|------|-------------------|-----------|
| **LionInput** | `input/src/LionInput.js` | `LionField, NativeTextFieldMixin` | 1 - TESTOWY |
| **LionTextarea** | `textarea/src/LionTextarea.js` | `LionField, NativeTextFieldMixin` | 2 |
| **LionSelect** | `select/src/LionSelect.js` | `LionField` | 3 |
| **LionCheckbox** | `checkbox-group/src/LionCheckbox.js` | `ChoiceInputMixin` | 4 |
| **LionCheckboxGroup** | `checkbox-group/src/LionCheckboxGroup.js` | `ChoiceGroupMixin, FormGroupMixin` | 5 |
| **LionRadio** | `radio-group/src/LionRadio.js` | `ChoiceInputMixin` | 6 |
| **LionRadioGroup** | `radio-group/src/LionRadioGroup.js` | `ChoiceGroupMixin, FormGroupMixin` | 7 |
| **LionFieldset** | `fieldset/src/LionFieldset.js` | `FormGroupMixin` | 8 |
| **LionForm** | `form/src/LionForm.js` | (przez LionFieldset) | 9 |

#### Komponenty pochodne (dziedziczą z LionInput):

| Komponent | Plik | Import dodatkowy | Priorytet |
|-----------|------|-----------------|-----------|
| **LionInputEmail** | `input-email/src/LionInputEmail.js` | `IsEmail` validator | 10 |
| **LionInputDate** | `input-date/src/LionInputDate.js` | `IsDate` validator | 11 |
| **LionInputAmount** | `input-amount/src/LionInputAmount.js` | - | 12 |
| **LionInputIban** | `input-iban/src/LionInputIban.js` | - | 13 |
| **LionInputRange** | `input-range/src/LionInputRange.js` | - | 14 |
| **LionInputStepper** | `input-stepper/src/LionInputStepper.js` | - | 15 |
| **LionInputTel** | `input-tel/src/LionInputTel.js` | - | 16 |
| **LionInputDatepicker** | `input-datepicker/src/LionInputDatepicker.js` | - | 17 |
| **LionInputFile** | `input-file/src/LionInputFile.js` | - | 18 |
| **LionInputAmountDropdown** | `input-amount-dropdown/src/LionInputAmountDropdown.js` | - | 19 |
| **LionInputTelDropdown** | `input-tel-dropdown/src/LionInputTelDropdown.js` | - | 20 |

**Razem**: 20 komponentów do migracji

### 2.2 Strategia Migracji

#### Opcja A: Zmiana importów (ZALECANE - szybkie)

**Podejście**:
1. Zmienić import z `@lion/ui/form-core.js` na `@lion/ui/form-core-element-internals.js`
2. Uruchomić testy
3. Naprawić ewentualne problemy

**Zalety**:
- Szybkie (1-2 dni dla wszystkich komponentów)
- Minimalna ingerencja w kod
- Łatwe do zrevertowania

**Wady**:
- Wymaga utworzenia nowego export point
- Dual mode (stary i nowy system równocześnie)

#### Opcja B: Aliasowanie w package.json (EKSPERYMENTALNE)

**Podejście**:
Użyć aliasów w bundlerze/package.json aby `@lion/ui/form-core.js` wskazywał na `form-core-element-internals`

**Zalety**:
- Żadnych zmian w kodzie komponentów
- Globalna zmiana

**Wady**:
- Trudniejsze do kontrolowania
- Problemy z TypeScript
- Trudniejszy rollback

#### ✅ Wybór: **Opcja A - Zmiana importów**

### 2.3 Plan Krok po Kroku

---

### FAZA 0: Przygotowanie (2-3 dni)

#### Zadanie 0.1: Utworzenie nowego export point

**Plik**: `/packages/ui/exports/form-core-element-internals.js`

```javascript
// UWAGA: To jest nowa implementacja z Element Internals
// Dla starego API użyj: @lion/ui/form-core.js

// Core mixins
export { FocusMixin } from '../components/form-core-element-internals/src/FocusMixin.js';
export { FormatMixin } from '../components/form-core-element-internals/src/FormatMixin.js';
export { FormControlMixin } from '../components/form-core-element-internals/src/FormControlMixin.js';
export { InteractionStateMixin } from '../components/form-core-element-internals/src/InteractionStateMixin.js';
export { LionField } from '../components/form-core-element-internals/src/LionField.js';
export { NativeTextFieldMixin } from '../components/form-core-element-internals/src/NativeTextFieldMixin.js';

// Registration (dla kompatybilności z grupami)
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
````

**Zadania**:

- [ ] Utworzyć plik export
- [ ] Dodać TypeScript definitions (`.d.ts`)
- [ ] Zaktualizować package.json exports
- [ ] Zbudować i przetestować

#### Zadanie 0.2: Utworzenie skryptu migracji

**Plik**: `/scripts/migrate-to-element-internals.js` (NOWY)

```javascript
#!/usr/bin/env node

/**
 * Skrypt do automatycznej migracji komponentów na Element Internals
 *
 * Użycie:
 *   node scripts/migrate-to-element-internals.js input
 *   node scripts/migrate-to-element-internals.js --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.join(__dirname, '../packages/ui/components');

const COMPONENTS = [
  'input',
  'textarea',
  'select',
  'checkbox-group',
  'radio-group',
  'fieldset',
  'form',
  'input-email',
  'input-date',
  'input-amount',
  'input-iban',
  'input-range',
  'input-stepper',
  'input-tel',
  'input-datepicker',
  'input-file',
  'input-amount-dropdown',
  'input-tel-dropdown',
];

function migrateComponent(componentName) {
  const componentDir = path.join(componentsDir, componentName);
  const srcDir = path.join(componentDir, 'src');

  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  Skipping ${componentName} - no src directory`);
    return { success: false, reason: 'no-src' };
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  let changed = false;

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Zamień import
    content = content.replace(
      /from ['"]@lion\/ui\/form-core\.js['"]/g,
      `from '@lion/ui/form-core-element-internals.js'`,
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ ${file}`);
      changed = true;
    }
  }

  if (changed) {
    console.log(`✅ Migrated ${componentName}`);
    return { success: true };
  } else {
    console.log(`⏭️  No changes needed for ${componentName}`);
    return { success: true, noChanges: true };
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    console.log('🚀 Migrating all components to Element Internals...\n');

    const results = COMPONENTS.map(comp => ({
      component: comp,
      ...migrateComponent(comp),
    }));

    console.log('\n📊 Summary:');
    console.log(`Total: ${results.length}`);
    console.log(`Migrated: ${results.filter(r => r.success && !r.noChanges).length}`);
    console.log(`No changes: ${results.filter(r => r.noChanges).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
  } else if (args.length > 0) {
    const component = args[0];
    console.log(`🚀 Migrating ${component} to Element Internals...\n`);
    migrateComponent(component);
  } else {
    console.log('Usage:');
    console.log('  node scripts/migrate-to-element-internals.js <component>');
    console.log('  node scripts/migrate-to-element-internals.js --all');
    console.log('\nExample:');
    console.log('  node scripts/migrate-to-element-internals.js input');
  }
}

main();
```

**Zadania**:

- [ ] Utworzyć skrypt
- [ ] Nadać uprawnienia wykonywania
- [ ] Przetestować na jednym komponencie

#### Zadanie 0.3: Przygotowanie testów

**Zadania**:

- [ ] Dodać testy Element Internals (z Części 1)
- [ ] Uruchomić testy form-core-element-internals
- [ ] Upewnić się że wszystkie przechodzą (100%)

---

### FAZA 1: Migracja Komponentu Testowego (3-4 dni)

**Cel**: Zmigrować LionInput jako proof-of-concept

#### Zadanie 1.1: Migracja LionInput

**Plik**: `/packages/ui/components/input/src/LionInput.js`

```javascript
// PRZED:
import { LionField, NativeTextFieldMixin } from '@lion/ui/form-core.js';

// PO:
import { LionField, NativeTextFieldMixin } from '@lion/ui/form-core-element-internals.js';

// Reszta kodu bez zmian
export class LionInput extends NativeTextFieldMixin(LionField) {
  // ...
}
```

**Zadania**:

- [ ] Zmienić import (manualnie lub skryptem)
- [ ] Uruchomić build: `npm run build`
- [ ] Sprawdzić czy nie ma błędów TypeScript

#### Zadanie 1.2: Testy LionInput

**Zadania**:

- [ ] Uruchomić testy: `npm test -- --group input`
- [ ] Sprawdzić wszystkie test suites (format, validate, etc.)
- [ ] Naprawić ewentualne błędy
- [ ] Dodać testy specyficzne dla Element Internals

**Nowy test**: `/packages/ui/components/input/test/lion-input-element-internals.test.js`

```javascript
import { fixture, expect, html } from '@open-wc/testing';
import '@lion/ui/define/lion-input.js';

describe('lion-input Element Internals', () => {
  it('integrates with native form', async () => {
    const form = await fixture(html`
      <form>
        <lion-input name="username" .modelValue=${'john'}></lion-input>
      </form>
    `);
    const input = form.querySelector('lion-input');

    expect(input._internals.form).to.equal(form);

    const formData = new FormData(form);
    expect(formData.get('username')).to.equal('john');
  });

  it('supports form reset', async () => {
    const form = await fixture(html`
      <form>
        <lion-input name="field" .modelValue=${'initial'}></lion-input>
      </form>
    `);
    const input = form.querySelector('lion-input');

    input.modelValue = 'changed';
    form.reset();

    expect(input.modelValue).to.equal('initial');
  });

  it('sets :valid/:invalid pseudo-classes', async () => {
    const input = await fixture(html` <lion-input .validators=${[new Required()]}></lion-input> `);

    await input.validate();
    expect(input.matches(':invalid')).to.be.true;

    input.modelValue = 'value';
    await input.validate();
    expect(input.matches(':valid')).to.be.true;
  });
});
```

#### Zadanie 1.3: Manual testing

**Checklist**:

- [ ] Utworzyć demo page: `/docs/components/input/demos/element-internals.html`
- [ ] Testować w Chrome, Firefox, Safari
- [ ] Sprawdzić:
  - [ ] Form submission
  - [ ] Form reset
  - [ ] Validation messages
  - [ ] CSS pseudo-klasy
  - [ ] Accessibility (screen reader)

#### Zadanie 1.4: Dokumentacja

**Zadania**:

- [ ] Zaktualizować `/docs/components/input/overview.md`
- [ ] Dodać sekcję "Element Internals Support"
- [ ] Dodać przykład integracji z `<form>`

---

### FAZA 2: Migracja Podstawowych Komponentów (5-7 dni)

**Komponenty**: LionTextarea, LionSelect, LionFieldset

#### Zadanie 2.1: LionTextarea (dzień 1)

```bash
node scripts/migrate-to-element-internals.js textarea
npm test -- --group textarea
```

#### Zadanie 2.2: LionSelect (dzień 2)

```bash
node scripts/migrate-to-element-internals.js select
npm test -- --group select
```

#### Zadanie 2.3: LionFieldset (dzień 3)

```bash
node scripts/migrate-to-element-internals.js fieldset
npm test -- --group fieldset
```

**Uwaga dla Fieldset**:

- FormGroupMixin nadal używa custom registration
- Dzieci używają Element Internals
- Hybrid approach

#### Zadanie 2.4: Regression testing (dzień 4-5)

**Zadania**:

- [ ] Uruchomić pełny test suite: `npm test`
- [ ] Sprawdzić wszystkie migrowane komponenty
- [ ] Manual testing w przeglądarkach
- [ ] Accessibility testing

---

### FAZA 3: Migracja Choice Groups (4-5 dni)

**Komponenty**: LionCheckbox, LionCheckboxGroup, LionRadio, LionRadioGroup

#### Zadanie 3.1: Choice Inputs (dzień 1-2)

```bash
node scripts/migrate-to-element-internals.js checkbox-group
node scripts/migrate-to-element-internals.js radio-group
```

**Szczególna uwaga**:

- Checkbox/Radio używają ChoiceInputMixin
- Group używa ChoiceGroupMixin + FormGroupMixin
- Testować dokładnie interakcje grupa-dziecko

#### Zadanie 3.2: Testy integracyjne (dzień 3)

**Zadania**:

- [ ] Uruchomić choice group test suites
- [ ] Sprawdzić:
  - [ ] Single selection (radio)
  - [ ] Multiple selection (checkbox)
  - [ ] Validation na poziomie grupy
  - [ ] `modelValue` synchronizacja

#### Zadanie 3.3: Demo i dokumentacja (dzień 4-5)

---

### FAZA 4: Migracja LionForm (2-3 dni)

**Specjalne wymagania**:

- LionForm opakowuje natywny `<form>`
- Musi współpracować z Element Internals dzieci
- Testować submit, reset, validation

```bash
node scripts/migrate-to-element-internals.js form
```

---

### FAZA 5: Migracja Input Variants (5-7 dni)

**Batch migration**:

```bash
# Wszystkie input-* komponenty naraz
for comp in input-email input-date input-amount input-iban input-range \
            input-stepper input-tel input-datepicker input-file \
            input-amount-dropdown input-tel-dropdown; do
  echo "Migrating $comp..."
  node scripts/migrate-to-element-internals.js $comp
  npm test -- --group $comp
done
```

**Uwagi**:

- Większość dziedziczy z LionInput
- Powinny działać automatycznie po migracji LionInput
- Skupić się na testach specyficznych funkcji (parsery, formatery)

---

### FAZA 6: Verification & Documentation (3-5 dni)

#### Zadanie 6.1: Full Regression Testing

```bash
# Wszystkie testy
npm test

# Testy w różnych przeglądarkach
npm run test:browserstack
```

**Checklist**:

- [ ] Wszystkie testy przechodzą
- [ ] Żadne console warnings
- [ ] Performance benchmarks (porównać z przed migracją)

#### Zadanie 6.2: Dokumentacja

**Pliki do zaktualizowania**:

- [ ] `/docs/fundamentals/forms/overview.md`
- [ ] `/docs/fundamentals/forms/validation.md`
- [ ] `/docs/fundamentals/forms/formatting.md`
- [ ] Każdy komponent: `/docs/components/[name]/overview.md`

**Dodać sekcje**:

- Element Internals Support
- Form Integration
- Browser Compatibility
- Migration Guide (link)

#### Zadanie 6.3: Migration Guide

**Plik**: `/docs/guides/element-internals-migration.md` (NOWY)

Zawartość:

- Czym jest Element Internals
- Dlaczego migrowaliśmy
- Co się zmieniło (wewnętrznie)
- Co NIE się zmieniło (API publiczne)
- Troubleshooting
- FAQ

---

## Część 3: Harmonogram i Zasoby

### 3.1 Timeline

| Faza       | Czas          | Komponenty                      | Status   |
| ---------- | ------------- | ------------------------------- | -------- |
| **Faza 0** | 2-3 dni       | Przygotowanie                   | ⏳ To Do |
| **Faza 1** | 3-4 dni       | LionInput (testowy)             | ⏳ To Do |
| **Faza 2** | 5-7 dni       | Textarea, Select, Fieldset      | ⏳ To Do |
| **Faza 3** | 4-5 dni       | Checkbox, Radio groups          | ⏳ To Do |
| **Faza 4** | 2-3 dni       | LionForm                        | ⏳ To Do |
| **Faza 5** | 5-7 dni       | Input variants (11 komponentów) | ⏳ To Do |
| **Faza 6** | 3-5 dni       | Verification, Docs              | ⏳ To Do |
| **TOTAL**  | **24-34 dni** | **20 komponentów**              |          |

**Realistyczny timeline**: 5-7 tygodni (z buforem)

### 3.2 Podział pracy (jeśli zespół)

#### Developer 1 (Form Components):

- Faza 0: Setup
- Faza 1: LionInput
- Faza 2: Textarea, Select
- Faza 4: LionForm

#### Developer 2 (Groups):

- Faza 2: Fieldset
- Faza 3: Choice Groups

#### Developer 3 (Input Variants):

- Faza 5: Wszystkie input-\* komponenty

#### Tester/Dokumentacja:

- Continuous: Testy po każdej fazie
- Faza 6: Final verification + docs

### 3.3 Checkpoints

#### Checkpoint 1 (po Fazie 1):

- LionInput działa z Element Internals
- Wszystkie testy przechodzą
- GO/NO-GO decision

#### Checkpoint 2 (po Fazie 3):

- Wszystkie podstawowe komponenty zmigrowane
- Integration tests pass
- Performance OK

#### Checkpoint 3 (po Fazie 5):

- Wszystkie komponenty zmigrowane
- Full regression pass
- Ready for docs

### 3.4 Metryki Sukcesu

#### Code Quality:

- [ ] 100% testów przechodzi
- [ ] 0 TypeScript errors
- [ ] 0 console warnings w production
- [ ] Code coverage ≥ przed migracją

#### Functionality:

- [ ] Wszystkie komponenty działają identycznie
- [ ] Form integration działa
- [ ] Validation działa
- [ ] Accessibility zachowane

#### Performance:

- [ ] Bundle size: max +2% (Element Internals overhead)
- [ ] Runtime performance: min identyczna
- [ ] Memory usage: max +5%

#### Documentation:

- [ ] Migration guide kompletny
- [ ] Wszystkie komponenty zaktualizowane
- [ ] Przykłady działają
- [ ] API docs aktualne

---

## Część 4: Risk Management

### 4.1 Ryzyka i Mitigacje

#### Ryzyko 1: Breaking Changes w API

**Prawdopodobieństwo**: Niskie  
**Impact**: Wysoki

**Mitigacja**:

- Test suites pokrywają całe publiczne API
- Manual testing przed release
- Beta release dla early adopters

#### Ryzyko 2: Performance Regression

**Prawdopodobieństwo**: Średnie  
**Impact**: Średni

**Mitigacja**:

- Benchmarki przed i po
- Performance budgets
- Continuous monitoring

#### Ryzyko 3: Browser Compatibility

**Prawdopodobieństwo**: Niskie  
**Impact**: Wysoki

**Mitigacja**:

- Element Internals widely supported (Chrome 77+, Firefox 93+, Safari 16.4+)
- Fallback plan: polyfill
- Dokumentować wymagania

#### Ryzyko 4: Test Failures

**Prawdopodobieństwo**: Wysokie  
**Impact**: Niski

**Mitigacja**:

- Inkrementalna migracja (komponent po komponencie)
- Rollback możliwy na każdym etapie
- Dedykowany czas na fixing

### 4.2 Rollback Plan

#### Jeśli Faza 1 fails:

1. Revert changes w LionInput
2. Analiza problemu
3. Fix w form-core-element-internals
4. Retry

#### Jeśli późniejsza faza fails:

1. Revert tylko problematyczny komponent
2. Pozostałe zachować
3. Investigate i fix
4. Continue

#### Emergency rollback:

1. Wszystkie komponenty z powrotem na `@lion/ui/form-core.js`
2. Skrypt: `node scripts/rollback-element-internals.js --all`
3. Publish hotfix

---

## Część 5: Po Migracji

### 5.1 Deprecation Path (następny krok)

**Zgodnie z**: `element-internals-cleanup-plan.md`

1. **Deprecate stary form-core** (następny sprint)
   - Dodać warnings
   - Dokumentować deprecation

2. **Rename packages** (za 2-3 miesiące)
   - `form-core-element-internals` → `form-core`
   - Stary `form-core` → `form-core-legacy`

3. **Remove legacy** (major version bump)
   - Usunąć `form-core-legacy`
   - Clean up

### 5.2 Future Enhancements

**Możliwości dzięki Element Internals**:

1. **Lepsza integracja z formularzami**

   ```javascript
   // Natywna walidacja HTML5
   <form>
     <lion-input name="email" required></lion-input>
   </form>
   ```

2. **CSS Pseudo-klasy out of the box**

   ```css
   lion-input:invalid {
     border-color: red;
   }
   lion-input:valid {
     border-color: green;
   }
   ```

3. **Constraint Validation API**

   ```javascript
   lionInput.validity.valueMissing; // natywne
   lionInput.validationMessage; // natywne
   lionInput.checkValidity(); // natywne
   ```

4. **Uproszczenie kodu**
   - Usunięcie ~543 linii registration code
   - Prostsze mixiny
   - Lepsza maintainability

---

## Appendix A: Checklist Migracji Komponentu

Dla każdego komponentu:

### Pre-migration:

- [ ] Przeczytać kod komponentu
- [ ] Zidentyfikować zależności od form-core
- [ ] Sprawdzić istniejące testy
- [ ] Zaplanować specjalne przypadki

### Migration:

- [ ] Zmienić import na `form-core-element-internals.js`
- [ ] Build bez błędów
- [ ] TypeScript bez błędów

### Testing:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Test suites pass
- [ ] Manual testing
- [ ] Browser testing (Chrome, Firefox, Safari)
- [ ] Accessibility testing

### Documentation:

- [ ] Zaktualizować component docs
- [ ] Dodać Element Internals examples
- [ ] Sprawdzić storybook/demos

### Sign-off:

- [ ] Code review
- [ ] QA approval
- [ ] Documentation review
- [ ] Ready to merge

---

## Appendix B: Skrypty Pomocnicze

### B.1 Check Migration Status

**Plik**: `/scripts/check-migration-status.js`

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.join(__dirname, '../packages/ui/components');

const COMPONENTS = [
  'input',
  'textarea',
  'select',
  'checkbox-group',
  'radio-group',
  'fieldset',
  'form',
  'input-email',
  'input-date',
  'input-amount',
  'input-iban',
  'input-range',
  'input-stepper',
  'input-tel',
  'input-datepicker',
  'input-file',
  'input-amount-dropdown',
  'input-tel-dropdown',
];

function checkComponent(name) {
  const srcDir = path.join(componentsDir, name, 'src');
  if (!fs.existsSync(srcDir)) {
    return { migrated: null, files: [] };
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  let oldImports = 0;
  let newImports = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    if (content.includes('@lion/ui/form-core.js')) oldImports++;
    if (content.includes('@lion/ui/form-core-element-internals.js')) newImports++;
  }

  return {
    migrated: oldImports === 0 && newImports > 0,
    oldImports,
    newImports,
    files: files.length,
  };
}

console.log('📊 Migration Status\n');
console.log('Component                  Status      Files  Old  New');
console.log('─'.repeat(60));

let totalMigrated = 0;
for (const comp of COMPONENTS) {
  const status = checkComponent(comp);
  const statusIcon = status.migrated === null ? '⚪' : status.migrated ? '✅' : '❌';
  const name = comp.padEnd(25);

  console.log(
    `${name} ${statusIcon}      ${status.files || '-'}     ` +
      `${status.oldImports || '-'}    ${status.newImports || '-'}`,
  );

  if (status.migrated) totalMigrated++;
}

console.log('─'.repeat(60));
console.log(`\nProgress: ${totalMigrated}/${COMPONENTS.length} components migrated`);
console.log(`Percentage: ${Math.round((totalMigrated / COMPONENTS.length) * 100)}%`);
```

### B.2 Run Tests for Migrated Components

**Plik**: `/scripts/test-migrated.sh`

```bash
#!/bin/bash

# Uruchom testy tylko dla zmigrowanych komponentów

COMPONENTS=(
  "input"
  "textarea"
  "select"
  "checkbox-group"
  "radio-group"
  "fieldset"
  "form"
)

echo "🧪 Testing migrated components..."
echo ""

for comp in "${COMPONENTS[@]}"; do
  echo "Testing $comp..."
  npm test -- --group "$comp" || exit 1
done

echo ""
echo "✅ All migrated components passed!"
```

---

## Appendix C: FAQ

**Q: Czy muszę zmienić kod mojego komponentu?**  
A: Nie, tylko import. Publiczne API pozostaje takie samo.

**Q: Co jeśli moje testy przestaną działać?**  
A: Test suites są kompatybilne. Jeśli test fails, to prawdopodobnie bug w implementacji Element Internals.

**Q: Czy mogę użyć starego i nowego systemu jednocześnie?**  
A: Tak, w fazie przejściowej. Ale docelowo wszystko powinno być na Element Internals.

**Q: Kiedy będę mógł usunąć stary form-core?**  
A: Po pełnej migracji wszystkich komponentów + okres deprecation (2-3 miesiące).

**Q: Czy Element Internals wymaga polyfill?**  
A: Dla nowoczesnych przeglądarek nie. Dla starszych (Safari <16.4) możliwy polyfill.

**Q: Czy performance będzie lepsze?**  
A: Validation będzie szybsza (natywne API). Form registration też. Bundle może być minimalnie większy.

---

**Ostatnia aktualizacja**: 2025-12-16  
**Następny przegląd**: Po zakończeniu Fazy 1  
**Owner**: Team Lead / Architect  
**Status**: ✅ Gotowy do rozpoczęcia implementacji
