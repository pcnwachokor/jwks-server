const jose = require('node-jose');

let keyStore;

// Generate RSA keys and store them in the keystore
async function setupKeys() {
    if (!keyStore) {
        keyStore = jose.JWK.createKeyStore();
        await keyStore.generate('RSA', 2048, {
            kid: 'unique-key-id', // Key ID
            use: 'sig',           // For signing JWTs
        });
    }
}

// Serve the public keys in JWKS format
async function serveJWKS(req, res) {
    await setupKeys(); // Ensure keys are generated before serving
    res.json(keyStore.toJSON());
}

module.exports = { serveJWKS, setupKeys };
