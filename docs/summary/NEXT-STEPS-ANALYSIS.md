# Element Internals - Analiza Następnych Kroków

**Data**: 2025-12-17  
**Status**: Kompletna analiza po zakończeniu Faz 0-10  

---

## 1. STAN OBECNY - Co zostało zrealizowane

### ✅ Fazy 0-10 ZAKOŃCZONE (2025-12-16 do 2025-12-17)

#### Faza 0: Przygotowanie
- ✅ Export point: `@lion/ui/form-core-element-internals.js`
- ✅ Infrastruktura testowa
- ✅ Dokumentacja początkowa

#### Faza 1-6: Migracja Komponentów (według planu)
- ✅ LionInput (proof of concept)
- ✅ LionTextarea, LionSelect, LionFieldset
- ✅ Checkbox/Radio groups
- ✅ LionForm
- ✅ Wszystkie input-* variants
- ✅ Weryfikacja i dokumentacja

#### Faza 7: Element Internals Public API
- ✅ `checkValidity()` w ValidateMixin
- ✅ `reportValidity()` w ValidateMixin
- ✅ `checkValidity()` w FormGroupMixin (delegacja do dzieci)
- ✅ `reportValidity()` w FormGroupMixin (delegacja do dzieci)

#### Faza 8: FormDataMixin
- ✅ Automatyczna serializacja przez `_internals.setFormValue()`
- ✅ Wsparcie dla `FormData` API
- ✅ Integracja z natywnym `<form>`

#### Faza 9: Testy
- ✅ Uruchomienie testów
- ✅ Identyfikacja problemów

#### Faza 10: Bug Fixes
- ✅ Naprawa serializacji w ChoiceInputMixin
- ✅ Naprawa podwójnych eventów w FormGroupMixin
- ✅ Naprawa Unparseable.serializedValue()
- ✅ Commit końcowy

---

## 2. ANALIZA AKTUALNYCH PROBLEMÓW

### 🔴 Problem 1: Testy nie przechodzą w pełni

**Status testów**:
- Node tests: ✅ PASSING (28/28)
- Browser tests: ⚠️ **W TRAKCIE** (długie wykonanie)

**Ostatni log pokazuje**:
```
Chromium: |█                             | 0/193 test files
Firefox:  |▏                             | 0/193 test files  
Webkit:   |                              | 0/193 test files
```

**Możliwe przyczyny**:
1. Testy są bardzo powolne (193 pliki testowe)
2. Mogą występować timeouty
3. Niektóre testy mogą być niestabilne

**Co wiemy z poprzednich prób**:
- Straciliśmy ~4k testów podczas fazy 7-B (dodanie ValidateMixin methods)
- Zdecydowaliśmy się na Option 1: "Keep custom validation, add native methods"
- Ostatnie zmiany w Fazie 10 naprawiły serializację

### 🟡 Problem 2: TODOs i FIXMEs w kodzie

**Znalezione**:
```
- 52 TODOs w form-core-element-internals
- Głównie legacy comments z oryginalnego form-core
- Niektóre dotyczą v1 refactoringu
```

**Przykłady**:
```javascript
// TODO: [v1] set to undefined
// FIXME: attribute: false breaks tests
// TODO: check if this is a false positive
```

**Priorytet**: NISKI - większość to legacy, nie blokują funkcjonalności

### 🟢 Problem 3: Dual System (form-core vs form-core-element-internals)

**Stan obecny**:
- ✅ Oba systemy współistnieją
- ✅ Export points rozdzielone
- ⚠️ Stary `form-core` nadal używany przez część komponentów

**Co wymaga uwagi**:
- Nie wszystkie komponenty zewnętrzne mogą być zmigrowane
- Backward compatibility jest zachowana
- Plan deprecation istnieje (element-internals-cleanup-plan.md)

---

## 3. CO ZOSTAŁO DO ZROBIENIA - Krótkoterminowe

### 📋 Faza 11: STABILIZACJA TESTÓW (3-5 dni)

**Cel**: Upewnić się że wszystkie testy przechodzą stabilnie

#### Zadanie 11.1: Dokończenie uruchomienia testów
```bash
# Uruchomić pełny test suite z timeoutem
npm test -- --timeout 10000

# Lub osobno browser testy
npm run test:browser -- --timeout 10000
```

**Oczekiwany rezultat**:
- Wszystkie browser tests się wykonują
- Raport pokazuje passing/failing/pending
- Identyfikacja konkretnych problemów

#### Zadanie 11.2: Analiza failing tests
**Jeśli testy failują**:
1. Pogrupować według typu błędu
2. Zidentyfikować root cause
3. Naprawić batch po batch

**Prawdopodobne kategorie**:
- Serializacja (prawdopodobnie naprawiona w Fazie 10)
- Event timing (podwójne eventy - prawdopodobnie naprawione)
- Registration (grupa/dzieci)
- Validation (native vs custom)

#### Zadanie 11.3: Flaky tests
**Jeśli testy są niestabilne**:
```javascript
// Dodać proper waits
await element.updateComplete;
await aTimeout(0); // flush microtasks

// Użyć waitUntil z timeout
await waitUntil(() => element.hasFeedbackFor.includes('error'), 
  { timeout: 1000 }
);
```

#### Zadanie 11.4: Performance testów
**Jeśli testy są zbyt wolne**:
- Rozdzielić na mniejsze grupy
- Optymalizować fixtures
- Równoległe uruchamianie

---

### 📋 Faza 12: DOKUMENTACJA I PRZYKŁADY (2-3 dni)

**Cel**: Kompletna dokumentacja Element Internals

#### Zadanie 12.1: Element Internals Guide
**Plik**: `/docs/guides/element-internals-guide.md` (NOWY)

**Sekcje**:
1. **Czym jest Element Internals** - wprowadzenie
2. **Korzyści** - dlaczego używamy
3. **API Reference**:
   - `checkValidity()` - sprawdzenie walidności
   - `reportValidity()` - pokazanie błędów
   - `_internals.setValidity()` - ustawienie stanu
   - `_internals.setFormValue()` - wartość formularza
4. **Przykłady użycia**
5. **Browser Support**
6. **Migration z form-core**

#### Zadanie 12.2: Przykłady live
**Pliki**: Demo pages dla każdego komponentu

```html
<!-- /docs/components/input/demos/form-integration.html -->
<form id="myForm">
  <lion-input 
    name="email" 
    label="Email"
    .validators=${[new Required(), new IsEmail()]}
  ></lion-input>
  
  <button type="submit">Submit</button>
  <button type="button" id="validate">Validate</button>
</form>

<script>
  const form = document.getElementById('myForm');
  
  // Native form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      const data = new FormData(form);
      console.log('Email:', data.get('email'));
    }
  });
  
  // Manual validation
  document.getElementById('validate').addEventListener('click', () => {
    form.reportValidity(); // Shows browser tooltips!
  });
</script>
```

#### Zadanie 12.3: Update READMEs
**Pliki do zaktualizowania**:
- `/packages/ui/components/form-core-element-internals/README.md`
- Każdy komponent: dodać sekcję "Element Internals Support"
- Main README: link do guide

---

### 📋 Faza 13: INTEGRACJA Z LIONFORM (2-3 dni)

**Cel**: Pełna integracja natywnej walidacji z LionForm

#### Problem: LionForm obecnie nie używa checkValidity/reportValidity

**Obecny kod** (`LionForm.js`):
```javascript
submit() {
  // Używa custom logic
  this._submit();
}
```

**Proponowana zmiana**:
```javascript
/**
 * Submits the form using native Element Internals validation
 * @returns {boolean} Whether form is valid
 */
submit() {
  // Use native checkValidity for all form controls
  const isValid = this.checkValidity(); // Deleguje do FormGroupMixin
  
  if (isValid) {
    this._submitForm();
    return true;
  } else {
    // Show validation errors
    this.reportValidity(); // Pokazuje native tooltips
    return false;
  }
}

/**
 * Internal form submission
 * @private
 */
_submitForm() {
  const formData = new FormData(this._formNode);
  
  this.dispatchEvent(new CustomEvent('submit', {
    detail: { formData },
    bubbles: true,
    composed: true
  }));
  
  // Allow native submission if action is set
  if (this._formNode.action && !this.hasAttribute('prevent-default-submit')) {
    this._formNode.submit();
  }
}
```

**Testy do dodania**:
```javascript
it('validates form on submit using checkValidity()', async () => {
  const form = await fixture(html`
    <lion-form>
      <form>
        <lion-input name="required" .validators=${[new Required()]}></lion-input>
        <button type="submit">Submit</button>
      </form>
    </lion-form>
  `);
  
  const submitSpy = sinon.spy();
  form.addEventListener('submit', submitSpy);
  
  const button = form.querySelector('button');
  button.click();
  
  // Should NOT submit because validation fails
  expect(submitSpy).to.not.have.been.called;
  
  // Now make valid
  form.querySelector('lion-input').modelValue = 'value';
  button.click();
  
  // Should submit now
  expect(submitSpy).to.have.been.calledOnce;
});

it('shows validation tooltips via reportValidity()', async () => {
  const form = await fixture(html`
    <lion-form>
      <form>
        <lion-input name="email" .validators=${[new IsEmail()]}></lion-input>
      </form>
    </lion-form>
  `);
  
  const input = form.querySelector('lion-input');
  input.modelValue = 'not-an-email';
  
  // Call reportValidity
  const valid = form.reportValidity();
  
  expect(valid).to.be.false;
  // Browser should show native tooltip (hard to test, but we check the API call)
  expect(input._internals.validity.valid).to.be.false;
});
```

---

## 4. CO ZOSTAŁO DO ZROBIENIA - Średnioterminowe

### 📋 Faza 14: CSS PSEUDO-CLASSES (1-2 dni)

**Cel**: Udokumentować i przetestować natywne pseudo-klasy

Element Internals automatycznie dodaje:
- `:valid` / `:invalid`
- `:user-valid` / `:user-invalid` (nowsze przeglądarki)

**Dokumentacja**:
```css
/* Automatyczne style dla invalid fields */
lion-input:invalid {
  border-color: red;
}

lion-input:valid {
  border-color: green;
}

/* User-invalid: invalid TYLKO po interakcji */
lion-input:user-invalid {
  border-color: orange;
}
```

**Testy**:
```javascript
it('applies :invalid pseudo-class when validation fails', async () => {
  const input = await fixture(html`
    <lion-input .validators=${[new Required()]}></lion-input>
  `);
  
  await input.validate();
  
  expect(input.matches(':invalid')).to.be.true;
  expect(input.matches(':valid')).to.be.false;
});
```

**Przykładowe style guide**:
- Dodać do design system
- Pokazać best practices
- Accessibility considerations

---

### 📋 Faza 15: CONSTRAINT VALIDATION API (2-3 dni)

**Cel**: Pełne wsparcie dla HTML5 Constraint Validation

#### Dodatkowe atrybuty do wsparcia:
```html
<lion-input 
  required           <!-- maps to Required validator -->
  minlength="5"      <!-- maps to MinLength validator -->
  maxlength="20"     <!-- maps to MaxLength validator -->
  pattern="[A-Z]+"   <!-- maps to Pattern validator -->
  type="email"       <!-- maps to IsEmail validator -->
></lion-input>
```

#### Implementacja w FormControlMixin:
```javascript
connectedCallback() {
  super.connectedCallback();
  
  // Map HTML attributes to validators
  if (this.hasAttribute('required')) {
    this.validators = [...this.validators, new Required()];
  }
  
  if (this.hasAttribute('minlength')) {
    const min = parseInt(this.getAttribute('minlength'), 10);
    this.validators = [...this.validators, new MinLength(min)];
  }
  
  // etc...
}
```

**Korzyści**:
- Naturalna integracja z HTML
- Progressive enhancement
- Lepsze DevX

---

### 📋 Faza 16: PERFORMANCE OPTIMIZATION (3-5 dni)

**Cel**: Optymalizacja wydajności Element Internals

#### Benchmark areas:
1. **Validation speed** - native vs custom
2. **Form submission** - FormData creation
3. **Memory usage** - _internals overhead
4. **Bundle size** - przed/po

#### Optymalizacje do rozważenia:
```javascript
// Debounce setFormValue dla lepszej wydajności
_calculateValues() {
  // ... existing logic
  
  // Debounce native API call
  this._setFormValueDebounced(this.serializedValue);
}

_setFormValueDebounced = debounce((value) => {
  this._internals.setFormValue(value);
}, 0);
```

#### Testy performance:
```javascript
it('validates 1000 fields in <500ms', async () => {
  const start = performance.now();
  
  const fields = await fixture(html`
    <lion-fieldset>
      ${Array.from({ length: 1000 }, (_, i) => html`
        <lion-input name="field${i}" .validators=${[new Required()]}></lion-input>
      `)}
    </lion-fieldset>
  `);
  
  await fields.validate();
  
  const duration = performance.now() - start;
  expect(duration).to.be.lessThan(500);
});
```

---

## 5. CO ZOSTAŁO DO ZROBIENIA - Długoterminowe

### 📋 Faza 17: DEPRECATION FORM-CORE (zgodnie z cleanup plan)

**Timeline**: Po 2-3 miesiącach stabilnego działania

1. **Dodać deprecation warnings**
```javascript
// /packages/ui/components/form-core/src/LionField.js
console.warn(
  'DEPRECATED: @lion/ui/form-core is deprecated. ' +
  'Use @lion/ui/form-core-element-internals instead. ' +
  'See migration guide: https://...'
);
```

2. **Update dokumentacji**
- Oznacz stary form-core jako deprecated
- Redirect do nowego API
- Migration guide

3. **Major version bump** (v2.0)
- Rename: `form-core-element-internals` → `form-core`
- Rename: `form-core` → `form-core-legacy` (tymczasowo)
- Remove: `form-core-legacy` po kolejnych 6 miesiącach

---

### 📋 Faza 18: ADVANCED FEATURES

**Możliwości dzięki Element Internals**:

#### 1. Custom Validation Messages (lokalizowane)
```javascript
class LionField extends FormControlMixin(LitElement) {
  _updateValidityMessage() {
    const firstError = this.validationStates.error[0];
    
    if (firstError) {
      const message = this._getLocalizedMessage(firstError);
      this._internals.setValidity(
        { customError: true },
        message,
        this._inputNode
      );
    }
  }
}
```

#### 2. Form-Associated Custom Elements registration
```javascript
// Automatyczne dodanie do formularza
class LionField extends FormControlMixin(LitElement) {
  static formAssociated = true; // Already set
  
  // Można dodać custom lifecycle callbacks
  formResetCallback() {
    this.modelValue = this._initialModelValue;
  }
  
  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }
}
```

#### 3. Accessibility enhancements
```javascript
// Element Internals automatycznie:
// - Dodaje aria-invalid="true"
// - Linkuje z validation messages
// - Poprawia screen reader support
```

---

## 6. PLAN REALIZACJI - Rekomendacje

### ✅ PRIORYTET 1 - Natychmiastowe (1-2 tygodnie)

**Faza 11: Stabilizacja testów**
- ⏰ 3-5 dni
- 🎯 Wszystkie testy passing
- 🔥 KRYTYCZNE - blokuje dalszy rozwój

**Faza 12: Dokumentacja**
- ⏰ 2-3 dni
- 🎯 Element Internals Guide + examples
- 📚 Ważne dla adopcji

### ✅ PRIORYTET 2 - Krótkoterminowe (2-4 tygodnie)

**Faza 13: LionForm integration**
- ⏰ 2-3 dni
- 🎯 Native checkValidity/reportValidity
- ⚡ Wartościowe dla użytkowników

**Faza 14: CSS Pseudo-classes**
- ⏰ 1-2 dni
- 🎯 Dokumentacja + style guide
- 🎨 Nice to have

**Faza 15: Constraint Validation**
- ⏰ 2-3 dni
- 🎯 HTML attributes → validators
- 🚀 Progressive enhancement

### ⚠️ PRIORYTET 3 - Średnioterminowe (1-2 miesiące)

**Faza 16: Performance**
- ⏰ 3-5 dni
- 🎯 Benchmarks + optimizations
- 📊 Ważne dla production

### 🔮 PRIORYTET 4 - Długoterminowe (3-6+ miesięcy)

**Faza 17: Deprecation**
- ⏰ 1-2 tygodnie
- 🎯 Stary form-core → deprecated
- 🗑️ Cleanup techniczny

**Faza 18: Advanced Features**
- ⏰ Na żądanie
- 🎯 Custom enhancements
- ✨ Future proofing

---

## 7. PODSUMOWANIE

### ✅ CO DZIAŁA

1. **Element Internals core** - w pełni zaimplementowane
2. **Wszystkie komponenty zmigrowane** - form-core-element-internals
3. **Validation API** - checkValidity(), reportValidity(), setValidity()
4. **FormData API** - setFormValue(), native serialization
5. **Registration** - hybrid approach (custom + native)
6. **Backward compatibility** - dual system działa

### 🟡 CO WYMAGA UWAGI

1. **Testy** - weryfikacja że wszystkie 100% przechodzą
2. **Dokumentacja** - brak comprehensive guide
3. **LionForm** - nie używa w pełni native APIs
4. **Performance** - nie zrobiony benchmark

### 🔴 CO BRAKUJE (ale nie blokuje)

1. **CSS pseudo-classes docs** - nie udokumentowane
2. **HTML attributes** - brak mapowania na validatory
3. **Deprecation path** - nie rozpoczęty
4. **Advanced features** - custom callbacks, etc.

---

## 8. NASTĘPNE KROKI - KONKRETNE AKCJE

### DLA DEVELOPERA (TY):

**Krok 1 - DZISIAJ/JUTRO**:
```bash
# 1. Uruchom pełne testy z timeoutem
npm test -- --timeout 10000 > test-results-full.log 2>&1

# 2. Przeanalizuj wyniki
grep -E "passing|failing|pending" test-results-full.log

# 3. Jeśli są failures:
#    - Pogrupuj według typu
#    - Napraw batch po batch
#    - Re-test po każdym fix
```

**Krok 2 - TEN TYDZIEŃ**:
```bash
# 1. Stwórz Element Internals Guide
touch docs/guides/element-internals-guide.md

# 2. Dodaj live examples
# Dla każdego głównego komponentu

# 3. Update READMEs
# Dodaj sekcję "Element Internals Support"
```

**Krok 3 - NASTĘPNY TYDZIEŃ**:
```javascript
// Ulepsz LionForm
// Dodaj native checkValidity/reportValidity
// Napisz testy

// Dodaj HTML attributes support
// required, minlength, pattern, etc.
```

### DLA ZESPOŁU:

1. **Code Review** - przejrzeć wszystkie zmiany z Faz 0-10
2. **QA Testing** - manual testing w różnych przeglądarkach
3. **Documentation Review** - sprawdzić comprehensiveness
4. **Performance Testing** - benchmark przed/po

---

## 9. SUCCESS METRICS

### Krótkoterminowe (1-2 tygodnie):
- [ ] 100% testów passing stabilnie
- [ ] Element Internals Guide opublikowany
- [ ] LionForm używa native APIs
- [ ] Wszystkie komponenty udokumentowane

### Średnioterminowe (1-2 miesiące):
- [ ] Performance benchmarks: ≥ baseline
- [ ] Zero regression bugs
- [ ] Positive developer feedback
- [ ] HTML attributes support

### Długoterminowe (3-6 miesięcy):
- [ ] Stary form-core deprecated
- [ ] Migration complete w zewnętrznych projektach
- [ ] Advanced features w użyciu
- [ ] Uznanie jako best practice

---

**Ostatnia aktualizacja**: 2025-12-17  
**Następny przegląd**: Po zakończeniu Fazy 11 (stabilizacja testów)  
**Status**: ✅ PLAN GOTOWY - czekamy na decyzję o priorytetach  
**Owner**: Sebastian (Lead Developer)
