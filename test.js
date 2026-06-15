const fs = require('fs');
const assert = require('assert');
const test = require('node:test');

// Helper para extraer de forma segura el texto de #main-title
function getTitleText() {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const match = htmlContent.match(/<h1 id="main-title">(.*?)<\/h1>/);
    assert.ok(match, 'No se encontró el elemento con ID main-title (<h1 id="main-title">...</h1>)');
    return match[1];
}

test('Misma cantidad de ¡ al principio que ! al final', () => {
    const text = getTitleText();
    const startExclamations = (text.match(/^¡+/) || [''])[0].length;
    const endExclamations = (text.match(/!+$/) || [''])[0].length;
    assert.strictEqual(
        startExclamations, 
        endExclamations, 
        `El mensaje tiene '${startExclamations}' signos '¡' al principio y '${endExclamations}' signos '!' al final.`
    );
});

test('La primera palabra debe empezar con mayúscula', () => {
    const text = getTitleText();
    const cleanText = text.replace(/^¡+/, '').replace(/!+$/, '').trim();
    const firstChar = cleanText.charAt(0);
    assert.match(
        firstChar, 
        /^[A-ZÁÉÍÓÚÑ]/, 
        `La primera palabra empieza con '${firstChar}', pero debe comenzar con mayúscula.`
    );
});

test('Ninguna palabra debe tener mayúsculas intermedias o finales', () => {
    const text = getTitleText();
    const cleanText = text.replace(/^¡+/, '').replace(/!+$/, '').trim();
    const words = cleanText.split(/\s+/);
    for (const word of words) {
        const cleanWord = word.replace(/[,;.:]$/, ''); 
        if (cleanWord.length > 1) {
            const restOfWord = cleanWord.slice(1);
            assert.strictEqual(
                restOfWord, 
                restOfWord.toLowerCase(), 
                `La palabra "${word}" contiene mayúsculas incorrectas (solo se permite en la primera letra).`
            );
        }
    }
});

test('Todas las comas deben estar seguidas de espacios y precedidas por una letra', () => {
    const text = getTitleText();
    let index = text.indexOf(',');
    while (index !== -1) {
        const charBefore = text.charAt(index - 1);
        assert.match(
            charBefore, 
            /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]$/, 
            `La coma en la posición ${index} está precedida por '${charBefore}' (debe ser una letra).`
        );

        const charAfter = text.charAt(index + 1);
        assert.strictEqual(
            charAfter, 
            ' ', 
            `La coma en la posición ${index} debe estar seguida por un espacio.`
        );

        index = text.indexOf(',', index + 1);
    }
});
