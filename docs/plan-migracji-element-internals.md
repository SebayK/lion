# Plan Migracji do ElementInternals

Ten dokument przedstawia analizę pakietu `@lion/ui/components/form-core` oraz plan migracji do natywnego API `ElementInternals`.

### 1. Analiza Obecnej Implementacji

Pakiet `@lion/ui/components/form-core` dostarcza wszechstronny i wysoce rozszerzalny system do tworzenia elementów formularzy. Jest zbudowany na serii kompozytowych domieszek (mixins), które obsługują różne aspekty cyklu życia i zachowania kontrolki formularza.

- **`FormRegisteringMixin` i `FormRegistrarMixin`**: Ta para tworzy niestandardowy, oparty na JavaScripcie system rejestracji formularzy, pozwalający grupom nadrzędnym zarządzać podrzędnymi kontrolkami. Jest to system, który `ElementInternals` ma zastąpić natywnie.
- **`FormControlMixin`**: Jest to podstawowa domieszka, która zarządza podstawową strukturą (etykieta, tekst pomocy, element wejściowy) i dostępnością poprzez ręczne podpinanie atrybutów ARIA.
- **`FormatMixin`**: Zarządza konwersjami wartości (parsowanie, formatowanie, serializacja). `serializedValue` jest bezpośrednim analogiem wartości, którą `ElementInternals` by przesyłał.
- **`ValidateMixin`**: Potężny, niestandardowy silnik walidacji, który śledzi wiele typów walidacji i zarządza widocznością informacji zwrotnej na podstawie stanów interakcji. Jest to najbardziej złożona część do zmapowania na `ElementInternals`.
- **`InteractionStateMixin`**: Śledzi stany interakcji użytkownika, takie jak `touched` (dotknięty) i `dirty` (zmieniony). Są to kwestie UX na poziomie aplikacji, które w dużej mierze wykraczają poza zakres `ElementInternals`.
- **`FocusMixin`**: Zarządza stanami `focused` i `focusedVisible`, które mogą być częściowo zastąpione przez natywne pseudoklasy CSS dostarczane przez `ElementInternals`.
- **`FormGroupMixin` i `ChoiceGroupMixin`**: Obsługują komponenty złożone, takie jak zestawy pól (fieldsets) i grupy pól wyboru/radio, które wymagają specjalnego potraktowania, ponieważ `ElementInternals` jest przeznaczony głównie для kontrolek o pojedynczej wartości.

### 2. Wykonalność Migracji

Migracja do `ElementInternals` jest **wysoce wykonalna i zalecana**. Oferuje znaczące korzyści poprzez zastąpienie niestandardowego mechanizmu natywną funkcjonalnością przeglądarki, co prowadzi do uproszczenia, lepszej wydajności i lepszej zgodności ze standardami.

Jednak migracja **nie jest prostą podmianą**. Bogactwo istniejącego API Lion oznacza, że wymagane jest staranne mapowanie funkcji po funkcji.

### 3. Plan Migracji

Migrację można podzielić na następujące fazy:

---

#### ✅ Faza 1: Adopcja `ElementInternals` i Refaktoryzacja Powiązań z Formularzem

1.  **Włączenie `ElementInternals`**:
    - W bazowym komponencie formularza (`LionField`) dodaj właściwość statyczną: `static formAssociated = true;`.
    - W konstruktorze dołącz obiekt internals: `this._internals = this.attachInternals();`.

2.  **Refaktoryzacja `FormatMixin` do Przesyłania Wartości**:
    - Po obliczeniu `serializedValue`, użyj API `ElementInternals` do ustawienia wartości formularza.
    - Zmodyfikuj `_calculateValues`, aby wywoływał `this._internals.setFormValue(this.serializedValue)`. Dzięki temu wartość komponentu będzie dostępna dla nadrzędnego `<form>`.

3.  **Wycofanie Niestandardowego Systemu Rejestracji**:
    - `FormRegisteringMixin` i `FormRegistrarMixin`, które opierają się na zdarzeniu `form-element-register`, mogą zostać w dużej mierze wycofane. Natywne powiązanie z formularzem jest teraz obsługiwane przez przeglądarkę.
    - Kolekcja `formElements` w `FormGroupMixin` może nadal być użyteczna do programowego zarządzania grupą, ale nie jest już potrzebna do podstawowej rejestracji.

---

#### ✅ Faza 2: Migracja Systemu Walidacji

Jest to najważniejsza faza, mapująca niestandardowy `ValidateMixin` na `ElementInternals`.

1.  **Refaktoryzacja `ValidateMixin` do użycia `setValidity()`**:
    - Głównym celem metody `validate()` będzie teraz skonstruowanie obiektu `ValidityStateFlags` i komunikatu walidacyjnego.
    - To pojedyncze wywołanie zastąpi zarządzanie `hasFeedbackFor`, `showsFeedbackFor` i `validationStates`.
    - `this._internals.setValidity(validityFlags, validationMessage);`

2.  **Mapowanie Walidatorów Lion na `ValidityStateFlags`**:
    - `Required`: Mapuje się na `setValidity({ valueMissing: true }, message)`.
    - `MinLength`: Mapuje się na `setValidity({ tooShort: true }, message)`.
    - `MaxLength`: Mapuje się na `setValidity({ tooLong: true }, message)`.
    - `Pattern`: Mapuje się na `setValidity({ patternMismatch: true }, message)`.
    - `IsEmail`, `IsNumber`: Mapują się na `setValidity({ typeMismatch: true }, message)`.
    - Wszystkie inne niestandardowe walidatory będą używać flagi ogólnej: `setValidity({ customError: true }, message)`.
    - Jeśli walidacja przejdzie pomyślnie, wywołaj `this._internals.setValidity({})`.

3.  **Wykorzystanie Natywnych Pseudoklas Walidacji**:
    - Zastąp niestandardowe style oparte na atrybutach (np. `:host([has-feedback-for~="error"])`) natywnymi pseudoklasami `:valid` i `:invalid`, które teraz będą działać bezpośrednio на komponencie-hoście.

4.  **Aktualizacja Wyświetlania Komunikatów Walidacyjnych**:
    - Niestandardowy komponent `lion-validation-feedback` może zostać zachowany w celu zapewnienia spójnego interfejsu użytkownika.
    - Zamiast nasłuchiwać na niestandardowe zdarzenia, powinien teraz odczytywać komunikat walidacyjny bezpośrednio z `this._internals.validationMessage`.
    - Logika w `InteractionStateMixin` (`touched`, `dirty`) powinna być nadal używana do określania, _kiedy_ pokazać komponent informacji zwrotnej, zachowując pożądane UX.

---

#### ✅ Faza 3: Uproszczenie Zarządzania Stanem

1.  **Refaktoryzacja `FocusMixin` i `DisabledMixin`**:
    - Przeglądarka będzie teraz automatycznie stosować pseudoklasy `:focus`, `:focus-visible` i `:disabled` do komponentu-hosta.
    - Redukuje to potrzebę śledzenia stanu opartego na JavaScripcie i odbijania atrybutów w celach stylizacyjnych. Domieszki mogą zostać uproszczone, aby obsługiwały tylko logikę, która pozostaje konieczna (jak polyfill dla `focusedVisible`).

2.  **Zachowanie `InteractionStateMixin`**:
    - `ElementInternals` nie obsługuje stanów `dirty` ani `touched`. Są one kluczowe dla doświadczenia użytkownika w pokazywaniu komunikatów walidacyjnych i powinny zostać zachowane w obecnej formie.

---

#### ✅ Faza 4: Obsługa Komponentów Złożonych

1.  **Adresowanie `FormGroupMixin` i `ChoiceGroupMixin`**:
    - `ElementInternals` jest przeznaczony dla kontrolek o pojedynczej wartości. Sam fieldset nie ma wartości do przesłania.
    - Dlatego ścieżka migracji jest tutaj hybrydowa:
      - Elementy podrzędne (`lion-input`, `lion-checkbox`) wewnątrz grupy będą używać `ElementInternals` do powiązania z nadrzędnym `<form>`.
      - `FormGroupMixin` i `ChoiceGroupMixin` zachowają swoje role do agregowania wartości podrzędnych w obiekt `modelValue`, uruchamiania walidacji na poziomie grupy i zarządzania dziećmi (np. `resetGroup`). Same nie będą używać `setFormValue`.

### Podsumowanie Korzyści

- **Natywna Integracja z Formularzem**: Komponenty będą bezproblemowo współpracować z elementami `<form>` (przesyłanie, resetowanie, kolekcja `form.elements`).
- **Uproszczony Kod**: Można usunąć niestandardowy, oparty na JavaScripcie system rejestracji formularzy.
- **Natywne Stylowanie**: Bezpośrednie użycie standardowych pseudoklas CSS, takich jak `:valid`, `:invalid`, `:disabled` na komponencie-hoście.
- **Lepsza Zgodność ze Standardami**: Zgodność z nowoczesną platformą internetową do tworzenia komponentów uczestniczących w formularzach.
