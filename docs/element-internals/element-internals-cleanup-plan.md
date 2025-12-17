# Element Internals - Plan Usunięcia Starej Logiki

## Status Aktualny

Implementacja Element Internals została zakończona w `@lion/ui/components/form-core-element-internals`. Wszystkie 4 fazy z oryginalnego planu migracji zostały zrealizowane:

✅ **Faza 1**: Adopcja `ElementInternals` i refaktor asocjacji formularza
✅ **Faza 2**: Migracja systemu walidacji
✅ **Faza 3**: Uproszczenie zarządzania stanem
✅ **Faza 4**: Obsługa komponentów kompozytowych

### Co zostało zaimplementowane:

1. **LionField** z `attachInternals()` i `static formAssociated = true`
2. **ValidateMixin** z `setValidity()` i mapowaniem na `ValidityStateFlags`
3. **FormatMixin** z `setFormValue()` dla wartości serializowanych
4. **Utrzymane mixiny**:
   - `InteractionStateMixin` (touched/dirty - poza scope Element Internals)
   - `FocusMixin` (uproszczony dla współpracy z natywnymi pseudo-klasami)
   - `FormGroupMixin` i `ChoiceGroupMixin` (dla komponentów kompozytowych)

### Co nadal istnieje ze starej logiki:

1. **System rejestracji** (`form-element-register` events):
   - `FormRegisteringMixin` (~101 linii)
   - `FormRegistrarMixin` (~277 linii)
   - `FormRegistrarPortalMixin` (~63 linii)
   - `FormControlsCollection` (~102 linii)
   - **Razem: ~543 linii kodu**

2. **Stary `@lion/ui/components/form-core`** - kompletna poprzednia implementacja

3. **Wszystkie komponenty** nadal importują z `@lion/ui/form-core.js` zamiast z nowego pakietu

## Analiza Zależności

### Komponenty używające form-core:

```
- LionInput (input)
- LionCheckbox, LionCheckboxGroup (checkbox-group)
- LionRadio, LionRadioGroup (radio-group)
- LionSelect (select)
- LionFieldset (fieldset)
- LionForm (form)
- Wszystkie inne komponenty input-* (input-date, input-amount, input-email, etc.)
```

### Mixiny z form-core używane przez komponenty:

- `LionField` - bazowy komponent dla wszystkich pól
- `NativeTextFieldMixin` - dla natywnych inputów
- `ChoiceInputMixin` - dla radio/checkbox
- `ChoiceGroupMixin` - dla radio-group/checkbox-group
- `FormGroupMixin` - dla fieldset/form
- Wszystkie validatory (Required, MinLength, IsEmail, etc.)

## Plan Działania - Etapy Migracji

---

## Etap 1: Deprecation i Dual Mode

**Cel**: Umożliwić płynne przejście, pozwalając obu systemom współistnieć

### 1.1 Oznaczenie starego kodu jako deprecated

**Zadania**:
- [ ] Dodać komentarze `@deprecated` do wszystkich exportów w `form-core.js`
- [ ] Dodać console.warn() w konstruktorach starych mixinów z informacją o deprecation
- [ ] Utworzyć plik `MIGRATION_GUIDE.md` z instrukcjami przejścia

**Lokalizacje**:
```
/packages/ui/exports/form-core.js
/packages/ui/components/form-core/src/**/*.js
```

**Przykład**:
```javascript
/**
 * @deprecated Use form-core-element-internals instead
 * This will be removed in version 1.0.0
 */
export class LionField extends ... {
  constructor() {
    super();
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'LionField from @lion/ui/form-core.js is deprecated. ' +
        'Please migrate to @lion/ui/form-core-element-internals.js'
      );
    }
  }
}
```

### 1.2 Utworzenie nowego eksportu

**Zadania**:
- [ ] Utworzyć `/packages/ui/exports/form-core-element-internals.js`
- [ ] Eksportować wszystkie komponenty i mixiny z nowej implementacji
- [ ] Zaktualizować dokumentację TypeScript

**Plik**: `/packages/ui/exports/form-core-element-internals.js`
```javascript
// Core mixins
export { FocusMixin } from '../components/form-core-element-internals/src/FocusMixin.js';
export { FormatMixin } from '../components/form-core-element-internals/src/FormatMixin.js';
export { FormControlMixin } from '../components/form-core-element-internals/src/FormControlMixin.js';
export { InteractionStateMixin } from '../components/form-core-element-internals/src/InteractionStateMixin.js';
export { LionField } from '../components/form-core-element-internals/src/LionField.js';
export { NativeTextFieldMixin } from '../components/form-core-element-internals/src/NativeTextFieldMixin.js';

// Registration (kept for compatibility with groups)
export { FormRegisteringMixin } from '../components/form-core-element-internals/src/registration/FormRegisteringMixin.js';
export { FormRegistrarMixin } from '../components/form-core-element-internals/src/registration/FormRegistrarMixin.js';
export { FormRegistrarPortalMixin } from '../components/form-core-element-internals/src/registration/FormRegistrarPortalMixin.js';
export { FormControlsCollection } from '../components/form-core-element-internals/src/registration/FormControlsCollection.js';

// Validation
export { ValidateMixin } from '../components/form-core-element-internals/src/validate/ValidateMixin.js';
// ... (wszystkie validatory)

// Groups
export { ChoiceGroupMixin } from '../components/form-core-element-internals/src/choice-group/ChoiceGroupMixin.js';
export { ChoiceInputMixin } from '../components/form-core-element-internals/src/choice-group/ChoiceInputMixin.js';
export { FormGroupMixin } from '../components/form-core-element-internals/src/form-group/FormGroupMixin.js';
```

**Czas realizacji**: 1-2 dni

---

## Etap 2: Migracja Komponentów

**Cel**: Przepisać wszystkie komponenty aby używały nowego `form-core-element-internals`

### 2.1 Migracja komponentów bazowych

**Kolejność** (od najprostszych do najbardziej złożonych):

1. **LionInput** (najprostszy - testowy)
   - Zmienić import z `@lion/ui/form-core.js` na `@lion/ui/form-core-element-internals.js`
   - Uruchomić testy
   - Poprawić ewentualne błędy

2. **LionFieldset**
   - Podobna prostota jak input
   - Używa FormGroupMixin

3. **LionCheckbox i LionCheckboxGroup**
   - Używa ChoiceInputMixin i ChoiceGroupMixin

4. **LionRadio i LionRadioGroup**
   - Analogicznie do checkbox

5. **LionSelect**
   - Bardziej złożony

6. **Wszystkie komponenty input-*** (input-email, input-date, input-amount, etc.)
   - Dziedziczą po LionInput, powinny automatycznie działać

7. **LionForm**
   - Najbardziej złożony - na końcu

**Zadania dla każdego komponentu**:
- [ ] Zmienić importy
- [ ] Uruchomić testy jednostkowe
- [ ] Uruchomić testy integracyjne
- [ ] Zaktualizować dokumentację komponentu
- [ ] Przetestować manualnie w przeglądarce

**Plik**: Przykład dla `LionInput`
```javascript
// Przed:
import { LionField, NativeTextFieldMixin } from '@lion/ui/form-core.js';

// Po:
import { LionField, NativeTextFieldMixin } from '@lion/ui/form-core-element-internals.js';
```

**Czas realizacji**: 3-5 dni (w zależności od liczby problemów)

### 2.2 Aktualizacja testów

**Zadania**:
- [ ] Przejrzeć wszystkie testy w `form-core-test-suites.js`
- [ ] Zaktualizować testy używające starych API
- [ ] Dodać testy dla Element Internals API (setFormValue, setValidity)
- [ ] Zaktualizować testy pomocnicze w `form-core-test-helpers.js`

**Czas realizacji**: 2-3 dni

---

## Etap 3: Analiza Systemu Rejestracji

**Cel**: Określić co z systemu rejestracji można usunąć, a co musi zostać

### 3.1 Identyfikacja użycia

**Zadania**:
- [ ] Przeanalizować użycie `form-element-register` events
- [ ] Sprawdzić czy FormGroupMixin/ChoiceGroupMixin nadal potrzebują FormRegistrarMixin
- [ ] Określić czy `FormControlsCollection` jest nadal potrzebny
- [ ] Sprawdzić użycie `_parentFormGroup` i `formElements`

**Pytania do rozstrzygnięcia**:
1. Czy `FormGroupMixin` potrzebuje znać swoje dzieci bez systemu rejestracji?
   - TAK - dla `modelValue`, `resetGroup()`, `validate()` grupy
   
2. Czy możemy użyć natywnego `form.elements` zamiast `formElements`?
   - Częściowo - `form.elements` działa dla `<form>`, ale nie dla `<fieldset>` czy custom grup

3. Czy potrzebujemy `form-element-register` events czy możemy użyć MutationObserver?
   - MutationObserver + DOM queries mogą zastąpić eventy

### 3.2 Refaktor systemu rejestracji

**Opcja A: Uproszczony system (zalecane)**

Zastąpić eventy prostym mechanizmem bazującym na DOM queries:

```javascript
// FormGroupMixin
get formElements() {
  // Dla fieldset/form - użyj querySelectorAll
  const elements = Array.from(
    this.querySelectorAll('[slot="input"], lion-input, lion-select, ...')
  );
  
  // Zwróć jako collection z dostępem po name
  return new FormControlsCollection(elements);
}
```

**Opcja B: Minimalna rejestracja**

Zachować tylko `FormRegistrarMixin` dla grup, usunąć resztę:
- Usunąć `FormRegisteringMixin` (nie potrzebny dla pojedynczych pól)
- Uprościć `FormRegistrarMixin` (tylko dla grup)
- Zachować `FormControlsCollection` (użyteczny interfejs)

**Zadania**:
- [ ] Wybrać opcję A lub B
- [ ] Zaimplementować uproszczeń
- [ ] Przetestować z grupami i formami
- [ ] Zmierzyć zmniejszenie rozmiaru kodu

**Czas realizacji**: 3-5 dni

---

## Etap 4: Usunięcie Starego Kodu

**Cel**: Fizycznie usunąć stary `form-core`

### 4.1 Przygotowanie do usunięcia

**Zadania**:
- [ ] Upewnić się, że wszystkie komponenty używają nowego systemu
- [ ] Upewnić się, że wszystkie testy przechodzą
- [ ] Przeszukać kod pod kątem pozostałych importów ze starego form-core
- [ ] Zaktualizować dokumentację

**Sprawdzenie**:
```bash
# Szukaj pozostałych importów
grep -r "from '@lion/ui/form-core.js'" packages/ui/components --include="*.js"

# Powinno zwrócić 0 wyników (poza samym form-core.js)
```

### 4.2 Rename i deprecation

**Zadania**:
- [ ] Zmienić nazwę `/components/form-core-element-internals` → `/components/form-core`
- [ ] Przenieść stary `/components/form-core` → `/components/form-core-legacy` (tymczasowo)
- [ ] Zaktualizować `exports/form-core.js` aby wskazywał na nowy kod
- [ ] Dodać `exports/form-core-legacy.js` dla wstecznej kompatybilności (temporary)

**Struktura docelowa**:
```
/packages/ui/components/
  ├── form-core/              # NOWY kod (poprzednio form-core-element-internals)
  └── form-core-legacy/       # STARY kod (do usunięcia w przyszłości)
```

**Czas realizacji**: 1-2 dni

### 4.3 Usunięcie legacy code (opcjonalnie - major version)

**Zadania** (tylko dla następnego major release):
- [ ] Usunąć `/components/form-core-legacy`
- [ ] Usunąć `exports/form-core-legacy.js`
- [ ] Zaktualizować CHANGELOG z breaking changes
- [ ] Zaktualizować migration guide

**Czas realizacji**: 1 dzień

---

## Etap 5: Optymalizacja i Dokumentacja

**Cel**: Zoptymalizować kod i zaktualizować dokumentację

### 5.1 Code cleanup

**Zadania**:
- [ ] Usunąć nieużywane komentarze odnoszące się do starego systemu
- [ ] Uprościć kod który już nie potrzebuje kompatybilności wstecznej
- [ ] Przejrzeć i zoptymalizować ValidateMixin.__mapToValidityStateFlags()
- [ ] Usunąć workarounds dla starych przeglądarek (jeśli Element Internals jest wspierane)

### 5.2 Dokumentacja

**Zadania**:
- [ ] Zaktualizować główny README.md
- [ ] Napisać szczegółowy migration guide
- [ ] Zaktualizować przykłady w dokumentacji
- [ ] Dodać sekcję "Element Internals Benefits" do docs
- [ ] Zaktualizować API docs dla wszystkich mixinów

**Pliki do aktualizacji**:
```
/docs/
  ├── element-internals-migration-plan.md (zaznaczyć jako completed)
  ├── element-internals-cleanup-plan.md (ten dokument)
  ├── MIGRATION_GUIDE.md (nowy)
  └── form-core/
      ├── overview.md
      ├── validation.md
      └── examples.md
```

### 5.3 Performance testing

**Zadania**:
- [ ] Zmierzyć rozmiar bundle przed i po
- [ ] Zmierzyć wydajność walidacji (Element Internals vs custom)
- [ ] Zmierzyć czas rejestracji formularza
- [ ] Porównać użycie pamięci

**Metryki do zmierzenia**:
- Bundle size reduction: oczekiwane ~5-10% (usunięcie ~543 linii registration code)
- Validation performance: oczekiwane ~20-30% szybsze (natywne API)
- Form registration: oczekiwane ~50% szybsze (natywna asocjacja)

**Czas realizacji**: 3-4 dni

---

## Harmonogram i Priorytety

### Milestone 1: Dual Mode (2 tygodnie)
- Etap 1: Deprecation i Dual Mode
- Deliverable: Możliwość korzystania z obu systemów

### Milestone 2: Full Migration (3-4 tygodnie)
- Etap 2: Migracja Komponentów
- Etap 3: Analiza Systemu Rejestracji
- Deliverable: Wszystkie komponenty używają Element Internals

### Milestone 3: Cleanup (1-2 tygodnie)
- Etap 4: Usunięcie Starego Kodu (partial)
- Etap 5: Optymalizacja i Dokumentacja
- Deliverable: Czytelny, zoptymalizowany kod z dokumentacją

### Milestone 4: Major Release (opcjonalnie)
- Etap 4: Usunięcie Starego Kodu (complete)
- Deliverable: Kompletne usunięcie legacy code

**Całkowity czas: 6-8 tygodni**

---

## Ryzyka i Mitigacje

### Ryzyko 1: Breaking changes w komponentach użytkowników

**Mitigacja**:
- Dual mode w pierwszej fazie
- Szczegółowy migration guide
- Deprecation warnings
- Wydać jako minor version (nie major) z deprecation
- Major version dopiero po kilku miesiącach

### Ryzyko 2: Problemy z kompatybilnością przeglądarek

**Mitigacja**:
- Element Internals jest wspierany w: Chrome 77+, Firefox 93+, Safari 16.4+
- Dodać polyfill dla starszych przeglądarek (opcjonalnie)
- Dokumentować wymagania przeglądarek

### Ryzyko 3: Regresje w testach

**Mitigacja**:
- Migrować komponenty jeden po drugim
- Uruchamiać pełny suite testów po każdym komponencie
- Manualne testy w wielu przeglądarkach
- Beta release przed finalnym

### Ryzyko 4: Nieznane zależności w systemie rejestracji

**Mitigacja**:
- Szczegółowa analiza w Etapie 3
- Zachować FormControlsCollection jeśli potrzebny
- Hybrid approach: Element Internals dla pojedynczych pól, uproszczony system dla grup

---

## Metryki Sukcesu

### Code Metrics
- [ ] Redukcja kodu: -543 linii (system rejestracji) + ~500-1000 linii (duplikacja)
- [ ] Bundle size: -5-10%
- [ ] 0 importów ze starego `form-core.js` (poza legacy export)

### Quality Metrics
- [ ] Wszystkie testy przechodzą (100%)
- [ ] Code coverage ≥ poprzedni poziom
- [ ] 0 console warnings w production build

### Performance Metrics
- [ ] Walidacja: +20-30% szybsza
- [ ] Form registration: +50% szybsza
- [ ] Memory usage: -10-15%

### Documentation Metrics
- [ ] Migration guide ukończony
- [ ] Wszystkie API docs zaktualizowane
- [ ] Przykłady działają z nowym systemem

---

## Kolejne Kroki

### Immediate (tydzień 1-2):
1. Utworzyć PR z deprecation warnings
2. Utworzyć `form-core-element-internals.js` export
3. Rozpocząć migrację LionInput (proof of concept)

### Short-term (tydzień 3-6):
1. Migrować pozostałe komponenty
2. Przeprowadzić analizę systemu rejestracji
3. Zaimplementować uproszczenia

### Long-term (tydzień 7-8+):
1. Cleanup i dokumentacja
2. Beta release
3. Zbieranie feedback
4. Final release

---

## Notatki Implementacyjne

### Co na pewno zachować:
- `InteractionStateMixin` - touched/dirty są poza scope Element Internals
- `FormControlsCollection` - wygodny interfejs dostępu
- `FormGroupMixin` i `ChoiceGroupMixin` - potrzebne dla kompozytów
- Wszystkie validatory - logika biznesowa

### Co można uprościć:
- `FormRegistrarMixin` - zmniejszyć do minimum dla grup
- `FormRegisteringMixin` - możliwe do usunięcia dla pojedynczych pól
- `FormRegistrarPortalMixin` - ocenić czy nadal potrzebny

### Co usunąć:
- `form-element-register` events - zastąpić DOM queries
- Duplikacja kodu między form-core i form-core-element-internals
- Workarounds dla starych implementacji

---

## Appendix: Porównanie API

### Stary system (form-core):
```javascript
// Rejestracja
dispatchEvent(new CustomEvent('form-element-register', { ... }))

// Walidacja
this.hasFeedbackFor = ['error'];
this.showsFeedbackFor = ['error'];
this.validationStates = { error: { Required: { ... } } };

// Wartość
this.formElements.serializedValue
```

### Nowy system (Element Internals):
```javascript
// Rejestracja
this._internals = this.attachInternals(); // automatyczna

// Walidacja
this._internals.setValidity({ valueMissing: true }, 'Field is required');

// Wartość
this._internals.setFormValue(this.serializedValue);

// Dostęp natywny
form.elements // zawiera komponenty z Element Internals
```

---

**Autor**: GitHub Copilot CLI  
**Data utworzenia**: 2025-12-15  
**Status**: Draft - do przeglądu i zatwierdzenia  
**Powiązane dokumenty**: 
- `element-internals-migration-plan.md` (zakończony)
- `MIGRATION_GUIDE.md` (do utworzenia)
