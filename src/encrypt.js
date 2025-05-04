import SimpleCrypto from 'simple-crypto-js';

const crypt = new SimpleCrypto(import.meta.env.VITE_ENCRYPT_KEY);

export default crypt;
