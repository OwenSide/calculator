const display = document.getElementById('display'); // Pobieramy element wyświetlacza
let currentInput = ''; // Przechowujemy bieżący wprowadzony tekst
let operator = ''; // Operator arytmetyczny
let previousInput = ''; // Poprzedni wprowadzony tekst
let result = 0; // Wynik obliczenia
let operationDisplay = ''; // Tekst do wyświetlania operacji
let parenthesesCount = 0; // Liczba otwartych nawiasów (do sprawdzania błędów)


// Dodajemy nasłuchiwacze na przyciski
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.innerText; // Pobieramy tekst z klikniętego przycisku

        // Obsługuje przycisk "CE" (czyści wszystko)
        if (value === 'CE') {
            currentInput = '';
            previousInput = '';
            operator = '';
            operationDisplay = '';
            parenthesesCount = 0;
            display.value = ''; // Czyścimy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        }
        // Obsługuje przycisk "←" (usuwa ostatni znak)
        else if (value === '←') {
            currentInput = currentInput.slice(0, -1); // Usuwamy ostatni znak z bieżącego inputu
            operationDisplay = operationDisplay.slice(0, -1); // Usuwamy ostatni znak z wyświetlania
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        }
        // Obsługuje liczby
        else if (!isNaN(value) || value === '.') {
            if (value === '.' && currentInput.includes('.')) return; // Zapobiega wielokrotnemu wprowadzaniu kropki
            currentInput += value; // Dodajemy wartość do bieżącego inputu
            operationDisplay += value; // Dodajemy wartość do wyświetlania operacji
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        }
        // Obsługuje nawiasy
        else if (value === '(') {
            currentInput += '('; // Dodajemy nawias otwierający do inputu
            operationDisplay += '('; // Dodajemy nawias otwierający do wyświetlania
            parenthesesCount++; // Zwiększamy licznik nawiasów
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        } 
        else if (value === ')') {
            currentInput += ')'; // Dodajemy nawias zamykający do inputu
            operationDisplay += ')'; // Dodajemy nawias zamykający do wyświetlania
            parenthesesCount--; // Zmniejszamy licznik nawiasów
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        }
        // Obsługuje operatory matematyczne
        else if (['+', '-', '×', '÷'].includes(value)) {
            if (currentInput === '') return; // Jeśli bieżący input jest pusty, nie dodajemy operatora
            previousInput = currentInput; // Przechowujemy bieżące wejście jako poprzednie
            currentInput = ''; // Czyszczenie bieżącego inputu
            operator = value; // Ustawiamy operator
            operationDisplay += value; // Dodajemy operator do wyświetlania operacji
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative'); // Usuwamy style błędu i ujemności
        }

        // Obsługuje procenty
        else if (value === '%') {
            if (currentInput === '') { // Jeśli nie wprowadzono liczby
                display.value = "Error: Wprowadź najpierw liczbę"; // Wyświetlamy komunikat o błędzie
                display.classList.add('error'); // Dodajemy klasę błędu do wyświetlacza
                return; // Kończymy funkcję
            }

            let percentageValue;

            if (previousInput !== '' && operator) { // Obliczamy procent między dwiema liczbami
                const previousNumber = parseFloat(previousInput);
                const currentNumber = parseFloat(currentInput);
                percentageValue = (previousNumber * currentNumber) / 100;

                if (operationDisplay.includes('(')) {
                    operationDisplay = operationDisplay.replace(
                        new RegExp(`${currentInput}$`), // Znajdujemy bieżącą liczbę na końcu wyrażenia
                        `${currentInput}%`
                    );
                    
                } else if (currentInput.length > 1) {
                    operationDisplay = operationDisplay.slice(0, -currentInput.length) + percentageValue;
                } else {
                    operationDisplay = operationDisplay.slice(0, operationDisplay.lastIndexOf(currentInput)) + percentageValue;
                }
                currentInput = percentageValue.toString(); // Przypisujemy wartość procentową
            } else { 
                // Obsługujemy przypadek z jedną wartością liczbową
                percentageValue = parseFloat(currentInput) / 100;
                currentInput = percentageValue.toString();

                if (operationDisplay.includes('(')) {
                    // Uwzględniamy kontekst nawiasów
                    operationDisplay = operationDisplay.replace(
                        new RegExp(`${currentInput}$`), // Znajdujemy bieżącą liczbę na końcu wyrażenia
                        `${currentInput}%`
                    );
                } else {
                    operationDisplay = currentInput; // Zamieniamy bieżącą liczbę na wartość procentową
                }
            }

            display.value = operationDisplay; // Aktualizujemy wyświetlacz
        }

        // Obsługuje równość (=)
        else if (value === '=') {
            if (currentInput === '' && previousInput === '') return; // Jeśli brak wprowadzonych liczb, nic nie robimy
            if (parenthesesCount > 0) {
                display.value = "Error: Brakuje ')'"; // Błąd: brak nawiasu zamykającego
                display.classList.add('error');
                return;
            }
            try {
                // Zastępujemy π i e odpowiednimi wartościami
                let expressionToEvaluate = operationDisplay
                    .replace(/×/g, '*') // Zastępujemy operatory na zgodne z JavaScript
                    .replace(/÷/g, '/') // Zastępujemy operatory na zgodne z JavaScript
                    .replace(/(?<=\d)π/g, `*${Math.PI}`) // Zastępujemy π po liczbie
                    .replace(/(π)(?![a-zA-Z0-9])/g, `${Math.PI}`) // Zastępujemy π, gdy jest samodzielne
                    .replace(/(?<=\d)e/g, `*${Math.E}`) // Zastępujemy e po liczbie
                    .replace(/(e)(?![a-zA-Z0-9])/g, `${Math.E}`) // Zastępujemy e, gdy jest samodzielne
                    .replace(/sin\(([^)]+)\)/g, (_match, p1) => `Math.sin(${p1} * Math.PI / 180)`) // Sinus w stopniach
                    .replace(/cos\(([^)]+)\)/g, (_match, p1) => `Math.cos(${p1} * Math.PI / 180)`) // Cosinus w stopniach
                    .replace(/tan\(([^)]+)\)/g, (_match, p1) => `Math.tan(${p1} * Math.PI / 180)`) // Tangens w stopniach
                    .replace(/ln\(([^)]+)\)/g, (_match, p1) => `Math.log(${p1})`) // Logarytm naturalny
                    .replace(/(?<!Math\.)log\(([^)]+)\)/g, (_match, p1) => `Math.log10(${p1})`) // Logarytm dziesiętny
                    .replace(/√\(([^)]+)\)/g, (_match, p1) => `Math.sqrt(${p1})`) // Pierwiastek kwadratowy
                    .replace(/EXP\(([^)]+)\)/g, (_match, p1) => `Math.exp(${p1})`) // Funkcja wykładnicza
                    .replace(/(\d+|\(.*?\))²/g, (_match, p1) => `${p1}**2`) // Potęga kwadratu
                    .replace(/([0-9]+)Inv\(([^)]+)\)/g, (_match, p2) => `1 / (${p2})`) // Inwersja
                    .replace(/\bMath\.Math/g, 'Math') // Usuwamy nadmiarowe Math.
                    .replace(/\bMath\.log10/g, 'Math.log10') // Poprawia zapis logarytmu dziesiętnego
                    .replace(/\^/g, '**') // Potęgowanie w JS
                    .replace(/(\d+(?:\.\d+)?)%/g, (_match, p1) => `${parseFloat(p1) / 100}`); // Zastępuje procent (%) jako dzielenie przez 100 (np. 50% -> 0.5)
                
                // Wykonujemy obliczenia
                result = evaluateExpression(expressionToEvaluate);

                // result = roundToZero(result);

                if (Number.isNaN(result)) { // Sprawdzamy, czy wynik to NaN
                    display.value = "Error";
                    display.classList.add('error');
                    console.log('Błąd: Wynik to NaN.');
                } else {
                    console.log(`Wynik: ${result}`);
                    display.value = result;
                    display.classList.remove('error');
                    operationDisplay = result.toString(); // Aktualizujemy wyświetlanie operacji
                    currentInput = result.toString();
                    previousInput = '';
                    operator = '';
                }
                if (result < 0) { // Obsługa liczby ujemnej
                    display.classList.add('negative');
                } else {
                    display.classList.remove('negative');
                }
            } catch (error) {
                if (error.message === 'Division by zero') {
                    display.value = "Error: Dzielenie przez zero"; // Obsługuje dzielenie przez zero
                } else if (error.message === 'Result is Infinity') {
                    display.value = "Error: Nieskończoność"; // Obsługuje wynik nieskończony
                } else {
                    display.value = "Error";
                }
                display.classList.add('error'); // Wyświetlamy błąd
            }
        }
        // Obsługuje funkcje matematyczne π
        else if (value === 'π') {
            // Jeśli input jest pusty, dodajemy π jako wartość liczbową
            if (currentInput === '') {
                currentInput = 'π'; // Ustawiamy wartość π
                operationDisplay += currentInput;
            } else if (!isNaN(currentInput)) {
                currentInput += 'π'; // Jeśli przed π jest liczba, dodajemy znak π
                operationDisplay += 'π';
            } else {
                currentInput += 'π'; // Jeśli nie ma liczby, po prostu dodajemy π
                operationDisplay += 'π';
            }
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative');
        }
        // Obsługuje dodawanie liczby e
        else if (value === 'e') {
            // Dodajemy e jako wartość liczbową
            if (currentInput === '') {
                currentInput = 'e'; // Ustawiamy wartość e
                operationDisplay += currentInput;
            } else if (!isNaN(currentInput)) {
                currentInput += 'e'; // Jeśli przed e jest liczba, dodajemy znak e
                operationDisplay += 'e';
            } else {
                currentInput += 'e'; // Jeśli nie ma liczby, po prostu dodajemy e
                operationDisplay += 'e';
            }
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative');
        }

        // Obsługuje funkcję inwersji (1/x)
        else if (value === 'Inv') {
            if (currentInput === '') { // Jeśli nie wprowadzono liczby
                display.value = "Error: Wprowadź najpierw liczbę"; // Wyświetlamy komunikat o błędzie
                display.classList.add('error'); // Dodajemy klasę błędu do wyświetlacza
                return; // Kończymy funkcję
            }        
            if (currentInput === '') return; // Jeśli brak liczby, nic nie robimy
            const invertedInput = `1 / (${currentInput})`; // Tworzymy wyrażenie inwersji
            operationDisplay = operationDisplay.slice(0, -currentInput.length) + invertedInput; // Zaktualizowane wyrażenie
            currentInput = invertedInput; // Aktualizujemy input
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative');
        }

        // Obsługuje funkcję potęgowania (x²)
        else if (value === 'x²') {
            if (currentInput === '') { // Jeśli nie wprowadzono liczby
                display.value = "Error: Wprowadź najpierw liczbę"; // Wyświetlamy komunikat o błędzie
                display.classList.add('error'); // Dodajemy klasę błędu do wyświetlacza
                return; // Kończymy funkcję
            }        
            if (currentInput === '') return; // Jeśli brak liczby, nic nie robimy
            const squaredInput = `${currentInput}²`; // Tworzymy wyrażenie potęgowania
            operationDisplay = operationDisplay.slice(0, -currentInput.length) + squaredInput; // Zaktualizowane wyrażenie
            currentInput = squaredInput; // Aktualizujemy input
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
        }

        // Obsługuje operator potęgowania (x^)
        else if (value === 'x^') {
            if (currentInput === '') { // Jeśli nie wprowadzono liczby
                display.value = "Error: Wprowadź najpierw liczbę"; // Wyświetlamy komunikat o błędzie
                display.classList.add('error'); // Dodajemy klasę błędu do wyświetlacza
                return; // Kończymy funkcję
            }        
            if (currentInput === '') return; // Jeśli brak liczby, nic nie robimy
            const exponentInput = `${currentInput}^`; // Tworzymy wyrażenie potęgowania
            operationDisplay = operationDisplay.slice(0, -currentInput.length) + exponentInput; // Zaktualizowane wyrażenie
            currentInput = exponentInput; // Aktualizujemy input
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
        }

        // Obsługuje funkcje matematyczne, takie jak sin, cos, tan
        else if (value === 'sin' || value === 'cos' || value === 'tan' || value === 'ln' || value === 'log' || value === '√' || value === 'EXP') {
            if (currentInput === '') {
                currentInput = value + '('; // Dodajemy funkcję i nawias otwierający
                operationDisplay += value + '('; // Dodajemy do wyświetlania
            } else {
                currentInput += value + '('; // Dodajemy funkcję i nawias otwierający
                operationDisplay += value + '('; // Dodajemy do wyświetlania
            }
            display.value = operationDisplay; // Aktualizujemy wyświetlacz
            display.classList.remove('error', 'negative');
        } 
    });
});

// Funkcja zaokrągla wartość do zera, jeśli jest mniejsza niż 1e-15, w przeciwnym razie zwraca oryginalną wartość.
// function roundToZero(value) {
//     return Math.abs(value) < 1e-15 ? 0 : value;
// }

function evaluateExpression(expr) {
    // Sprawdzamy, czy nie ma dzielenia przez zero
    if (/\/0(?!\d)/.test(expr)) { // Szukamy dzielenia przez 0, które nie jest zaraz po cyfrze
        throw new Error('Division by zero'); // Wyrzucamy błąd, jeśli znaleziono dzielenie przez zero
    }

    try {
        // Próbujemy obliczyć wyrażenie
        const result = eval(expr); // Wykonujemy obliczenie
        // Sprawdzamy, czy wynik jest liczbą
        if (!isFinite(result)) {
            throw new Error('Result is Infinity'); // Jeśli wynik to nieskończoność, wyrzucamy błąd
        }
        return result; // Zwracamy wynik obliczeń
    } catch (e) {
        return NaN; // Jeśli wystąpił błąd, zwracamy NaN (Not a Number)
    }
}



