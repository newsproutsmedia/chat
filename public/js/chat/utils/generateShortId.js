export function generateShortId(length) {
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ID_LENGTH = length || 8;

    let newId = '';
    for(let i=0; i < ID_LENGTH; i++) {
        newId += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return newId;
}