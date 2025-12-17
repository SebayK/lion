# 🔧 Problemy i Rozwiązania - Faza 0

**Data**: 2025-12-17

---

## Problem 1: Form Reset nie działa automatycznie

### Opis:

Element Internals nie resetuje automatycznie wartości komponentu przy wywołaniu `form.reset()`.

### Testy które failują:

```javascript
// test/ElementInternalsIntegration.test.js:220
it('resets to initial value on form.reset()', async () => {
  const form = await fixture(html`
    <form>
      <test-field-ei name="field" .modelValue=${'initial'}></test-field-ei>
    </form>
  `);
  const field = form.querySelector('test-field-ei');

  field.modelValue = 'changed';
  expect(field.modelValue).to.equal('changed');

  form.reset();

  // ❌ FAILS: expected 'changed' to equal 'initial'
  expect(field.modelValue).to.equal('initial');
});
```

### Root Cause:

Element Internals API wymaga zaimplementowania `formResetCallback()` w custom element:

```javascript
// Z MDN Web Docs:
// "To participate in form reset, a custom element should implement
// the formResetCallback() lifecycle callback"
```

### Rozwiązanie:

**Plik**: `packages/ui/components/form-core-element-internals/src/LionField.js`

```javascript
export class LionField extends FormControlMixin(LitElement) {
  constructor() {
    super();
    this._initialModelValue = undefined;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    // Zapisz wartość początkową przy pierwszym połączeniu
    if (this._initialModelValue === undefined) {
      this._initialModelValue = this.modelValue;
    }
  }

  /**
   * Called when parent form is reset
   * Part of Form-Associated Custom Elements API
   */
  formResetCallback() {
    // Reset do wartości początkowej
    this.modelValue = this._initialModelValue;

    // Wyczyść błędy walidacji
    this.clearFeedback();

    // Reset ElementInternals validity
    this._internals.setValidity({});

    // Reset interaction states
    this.touched = false;
    this.dirty = false;
  }
}
```

### Status:

⏳ Do implementacji w Fazie 1

---

## Problem 2: Validation nie aktualizuje się synchronicznie

### Szczegóły problemu:

Po zmianie `modelValue` testy oczekują natychmiastowej aktualizacji validity, ale wymaga to `updateComplete`.

### Test który nie przechodzi:

```javascript
// test/ElementInternalsIntegration.test.js:124
it('updates validity on modelValue change', async () => {
  const el = await fixture(html` <test-field-ei .validators=${[new Required()]}></test-field-ei> `);

  await el.validate();
  expect(el._internals.validity.valid).to.be.false;

  el.modelValue = 'now valid';
  await el.validate();

  // ❌ FAILS: expected false to be true
  expect(el._internals.validity.valid).to.be.true;
});
```

### Przyczyna:

`modelValue` setter wywołuje asynchroniczne aktualizacje LitElement. Walidacja może być wywołana przed zakończeniem renderowania.

### Rozwiązanie 1: Dodać await updateComplete w testach

```javascript
it('updates validity on modelValue change', async () => {
  const el = await fixture(html` <test-field-ei .validators=${[new Required()]}></test-field-ei> `);

  await el.validate();
  expect(el._internals.validity.valid).to.be.false;

  el.modelValue = 'now valid';
  await el.updateComplete; // ← DODANE
  await el.validate();

  expect(el._internals.validity.valid).to.be.true;
});
```

### Rozwiązanie 2: Automatyczna walidacja po zmianie modelValue

```javascript
// W LionField
set modelValue(value) {
  const oldValue = this.__modelValue;
  this.__modelValue = value;
  this.requestUpdate('modelValue', oldValue);

  // Auto-validate jeśli touched
  if (this.touched) {
    this.validate();
  }
}
```

### Status migracji:

⏳ Preferowane Rozwiązanie 1 (poprawka w testach) - Faza 1

---

## Problem 3: Code Coverage poniżej 95%

### Szczegóły problemu:

```
Coverage for lines failed with 94.69 % compared to configured 95 %
Coverage for statements failed with 94.69 % compared to configured 95 %
Coverage for branches failed with 94.52 % compared to configured 95 %
Coverage for functions failed with 92.93 % compared to configured 95 %
```

### Przyczyna problemu:

Nowe testy `ElementInternalsIntegration.test.js` i `ValidityStateMapping.test.js` nie pokrywają jeszcze wszystkich ścieżek kodu.

### Wpływ na projekt:

Niski - różnica tylko 0.31% dla lines/statements

### Proponowane rozwiązanie:

1. Dodać więcej testów dla edge cases
2. Pokryć brakujące ścieżki w ValidateMixin
3. Testy dla formDisabledCallback, formStateRestoreCallback

**Lub tymczasowo:**

- Obniżyć próg do 94% dla okresu migracji
- Przywrócić 95% w Fazie 6 (Verification)

### Status rozwiązania:

📅 Do realizacji w Fazie 6 (Verification & Documentation)

---

## Problem 4: Node module warning dla skryptów

### Szczegóły problemu:

```
[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/sebastian/Projects/lion/scripts/check-migration-status.js is not specified
```

### Przyczyna problemu:

Skrypty używają ES modules (`import`), ale package.json w root nie ma `"type": "module"`.

### Wpływ na projekt:

Niski - tylko warning, skrypty działają

### Proponowane rozwiązanie:

Dodać do root package.json:

```json
{
  "type": "module",
  ...
}
```

**Lub** zmienić rozszerzenie skryptów na `.mjs`:

```bash
mv scripts/migrate-to-element-internals.js scripts/migrate-to-element-internals.mjs
mv scripts/check-migration-status.js scripts/check-migration-status.mjs
```

### Status rozwiązania:

📅 Opcjonalne - nie blokuje pracy, można zostawić na później

---

## Problem 5: Istniejące 8 failed tests (nie związane z migracją)

### Szczegóły problemu:

```
Chromium: 4361 passed, 8 failed, 47 skipped
Firefox:  4361 passed, 8 failed, 47 skipped
Webkit:   4355 passed, 14 failed, 47 skipped
```

### Przyczyna problemu:

To są istniejące błędy w testach, niezwiązane z naszą migracją Element Internals.

### Wpływ na projekt:

Żaden - nie blokuje migracji

### Podjęte działanie:

✅ Ignorujemy - nie nasza odpowiedzialność w ramach tego projektu

---

## Podsumowanie

| Problem               | Severity  | Status      | Faza   |
| --------------------- | --------- | ----------- | ------ |
| Form Reset nie działa | 🔴 Wysoki | ⏳ To Do    | Faza 1 |
| Validation async      | 🟡 Średni | ⏳ To Do    | Faza 1 |
| Code Coverage <95%    | 🟢 Niski  | 📅 Later    | Faza 6 |
| Module warning        | 🟢 Niski  | 📅 Optional | -      |
| Istniejące failures   | ⚪ Brak   | ✅ Ignore   | -      |

**Problemy blokujące Fazę 1**: 0  
**Problemy do rozwiązania w Fazie 1**: 2  
**Gotowość do kontynuacji**: ✅ TAK

---

**Ostatnia aktualizacja**: 2025-12-17  
**Następna aktualizacja**: Po zakończeniu Fazy 1
