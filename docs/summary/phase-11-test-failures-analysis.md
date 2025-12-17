# Phase 11: Test Failures Analysis

**Data**: 2025-12-17  
**Status**: IN PROGRESS  
**Cel**: Zredukować failed testy z 67-87 do <10

## Test Summary

| Browser  | Passed | Failed | Skipped | Success Rate |
|----------|--------|--------|---------|--------------|
| Chromium | 3,438  | 67     | 41      | 98.1%        |
| Firefox  | 3,810  | 81     | 41      | 97.9%        |
| Webkit   | 3,807  | 87     | 41      | 97.8%        |

**Coverage**: 95.8% (target: 95%) ✅

---

## Kategorie Błędów (106 total failures)

### 🔴 GRUPA 1: Unparseable Serialization (18 failures)
**Priorytet**: CRITICAL  
**Impact**: Wszystkie komponenty z FormatMixin

**Problem**:
```javascript
// Expected:
modelValue instanceof Unparseable // true

// Actual:
modelValue = { type: 'unparseable', viewValue: 'foo' } // plain object
```

**Komponenty dotknięte**:
- LionInput
- LionInputAmount
- LionInputDate
- LionInputEmail
- LionInputIban
- LionInputDatepicker
- LionTextarea

**Root cause**: FormDataMixin serializes Unparseable as JSON string instead of handling specially

**Plik**: `packages/ui/components/form-core-element-internals/src/FormDataMixin.js`

**Fix strategy**:
1. Check if modelValue is Unparseable instance
2. Don't serialize Unparseable to FormData
3. Keep viewValue in input._inputNode.value

---

### 🟡 GRUPA 2: Model-Value-Changed Double Events (10 failures)
**Priorytet**: HIGH  
**Impact**: Choice groups (radio/checkbox)

**Problem**:
```javascript
// Expected: 1 event
// Actual: 2 events
```

**Root cause**: Both ChoiceInputMixin and FormControlMixin fire events

**Pliki**:
- `packages/ui/components/form-core-element-internals/src/choice-group/ChoiceInputMixin.js`
- `packages/ui/components/form-core-element-internals/src/FormControlMixin.js`

**Fix strategy**:
1. Debounce event firing in ChoiceInputMixin
2. Prevent double dispatch when checked changes

---

### 🟡 GRUPA 3: Choice Group Serialization (10 failures)
**Priorytet**: HIGH  
**Impact**: Multi-select radio/checkbox groups

**Problem**:
```javascript
// Expected:
{ 'gender[]': ['female'] }

// Actual:
{ 'gender[]': [['female']] } // double array
```

**Root cause**: Array wrapping in serializedValue

**Plik**: `packages/ui/components/form-core-element-internals/src/choice-group/ChoiceGroupMixin.js`

**Status**: Partially fixed in Phase 10, but still failing in Firefox/Webkit

**Fix strategy**:
1. Review serializedValue getter in ChoiceGroupMixin
2. Ensure single-level array for multiple selection
3. Test across all browsers

---

### 🟠 GRUPA 4: Input-Tel Region Codes (8 failures)
**Priorytet**: MEDIUM  
**Impact**: LionInputTel only

**Problem**:
```javascript
// Expected activeRegion: 'NL'
// Actual activeRegion: 'GB'
```

**Root cause**: Default region not properly initialized when PhoneUtilManager loads

**Plik**: `packages/ui/components/input-tel/src/LionInputTel.js`

**Fix strategy**:
1. Check initialization order
2. Ensure defaultRegion is respected when modelValue is unparseable

---

### 🟠 GRUPA 5: LionForm Validation (8 failures)
**Priorytet**: MEDIUM  
**Impact**: Form submission flow

**Problem**:
- `submitted` state not set correctly
- `novalidate` attribute not working
- Nested fieldsets validation broken

**Root cause**: LionForm needs to use Element Internals validation API

**Plik**: `packages/ui/components/form/src/LionForm.js`

**Status**: Partially fixed in Phase 10, still issues remain

**Fix strategy**:
1. Ensure checkValidity() traverses all registered children
2. Fix submitted state management
3. Handle novalidate properly

---

### 🔵 GRUPA 6: Browser-Specific (10 failures)
**Priorytet**: LOW  
**Impact**: Webkit-only issues

**Problem**:
- Input-amount-dropdown template issues (Webkit only)
- Browser disconnection errors (Chromium flakiness)

**Fix strategy**:
- May be environmental/timing issues
- Re-run after fixing other groups

---

### 🟢 GRUPA 7: Misc Edge Cases (10 failures)
**Priorytet**: LOW  
**Impact**: Various edge cases

**Problems**:
- Focus management in nested fieldsets
- Submit button event propagation
- Name validation for arrays

**Fix strategy**:
- Address after main groups fixed

---

## Fix Priority Order

```
1. 🔴 GRUPA 1: Unparseable (18) - MUST FIX
   └─> Blocking many components

2. 🟡 GRUPA 2: Double Events (10) - SHOULD FIX
   └─> Choice groups broken

3. 🟡 GRUPA 3: Serialization (10) - SHOULD FIX
   └─> Related to GRUPA 2

4. 🟠 GRUPA 4: InputTel (8) - NICE TO FIX
   └─> Component-specific

5. 🟠 GRUPA 5: Form Validation (8) - NICE TO FIX
   └─> Edge cases mostly

6. 🔵 GRUPA 6: Browser-specific (10) - INVESTIGATE
   └─> May auto-resolve

7. 🟢 GRUPA 7: Edge cases (10) - BACKLOG
   └─> Low priority
```

---

## Timeline

### Week 1 (Dec 17-20)
- [x] Analysis complete
- [ ] Fix GRUPA 1: Unparseable serialization
- [ ] Fix GRUPA 2: Double events
- [ ] Target: -28 failures

### Week 2 (Dec 23-27)
- [ ] Fix GRUPA 3: Choice group serialization
- [ ] Fix GRUPA 4: InputTel region codes
- [ ] Fix GRUPA 5: Form validation
- [ ] Target: -26 failures (total: -54)

### Week 3 (Dec 30-Jan 3)
- [ ] Investigation GRUPA 6
- [ ] Fix GRUPA 7 edge cases
- [ ] Target: <10 failures total

---

## Success Metrics

- ✅ <10 failed tests
- ✅ 95%+ coverage maintained
- ✅ All critical paths working
- ✅ All browsers passing core tests

---

## Notes

- Most failures are systematic (affect multiple components)
- Fixing GRUPA 1-3 should resolve ~70% of failures
- Browser-specific failures may be test environment issues
- Edge cases can be addressed in Phase 12 if needed
