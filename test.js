const fs = require('fs');
const assert = require('assert');
const test = require('node:test');

test('Validación del saludo en index.html', () => {
    // 1. Leer el archivo HTML
    const htmlContent = fs.readFileSync('index.html', 'utf8');

    // 2. Extraer el texto de #main-title
    const match = htmlContent.match(/<h1 id="main-title">(.*?)<\/h1>/);
    assert.ok(match, 'No se encontró el elemento con ID main-title (<h1 id="main-title">...</h1>)');
    
    const text = match[1];
    console.log(`Texto a evaluar: "${text}"`);

    // Regla 1: Misma cantidad de ¡ al principio que ! al final.
    const startExclamations = (text.match(/^¡+/) || [''])[0].length;
    const endExclamations = (text.match(/!+$/) || [''])[0].length;
    assert.strictEqual(
        startExclamations, 
        endExclamations, 
        `El mensaje debe tener la misma cantidad de '¡' al principio (${startExclamations}) que '!' al final (${endExclamations}).`
    );

    // Limpiamos el texto de los signos de exclamación externos para evaluar las palabras
    const cleanText = text.replace(/^¡+/, '').replace(/!+$/, '').trim();

    // Regla 2: La primera palabra empiece con mayúscula.
    const firstChar = cleanText.charAt(0);
    assert.match(
        firstChar, 
        /^[A-ZÁÉÍÓÚÑ]/, 
        `La primera palabra debe empezar con una letra mayúscula. Encontrado: '${firstChar}'`
    );

    // Regla 3: Ninguna palabra tenga mayúsculas en un lugar que no sea la primera letra.
    const words = cleanText.split(/\s+/);
    for (const word of words) {
        // Quitamos comas o puntos al final de la palabra para evaluarla limpiamente
        const cleanWord = word.replace(/[,;.:]$/, ''); 
        if (cleanWord.length > 1) {
            const restOfWord = cleanWord.slice(1);
            // Comprobamos que el resto de la palabra esté completamente en minúsculas
            assert.strictEqual(
                restOfWord, 
                restOfWord.toLowerCase(), 
                `La palabra "${word}" no debe contener mayúsculas intermedias o finales (solo la primera letra puede ser mayúscula).`
            );
        }
    }

    // Regla 4: Todas las comas estén seguidas de espacios y precedidas por una letra.
    let index = text.indexOf(',');
    while (index !== -1) {
        // Verificar carácter anterior (debe ser una letra)
        const charBefore = text.charAt(index - 1);
        assert.match(
            charBefore, 
            /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]$/, 
            `La coma en la posición ${index} debe estar precedida por una letra. Encontrado: '${charBefore}'`
        );

        // Verificar carácter posterior (debe ser un espacio)
        const charAfter = text.charAt(index + 1);
        assert.strictEqual(
            charAfter, 
            ' ', 
            `La coma en la posición ${index} debe estar seguida por un espacio.`
        );

        index = text.indexOf(',', index + 1);
    }
});
