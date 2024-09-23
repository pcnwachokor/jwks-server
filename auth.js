const jwt = require('jsonwebtoken');
const { setupKeys, keyStore } = require('./keys');

// Issue JWT based on request and key information
async function issueToken(req, res) {
    // Ensure keys are set up before issuing the token
    await setupKeys();

    const expired = req.query.expired === 'true';
    const [key] = keyStore.all({ use: 'sig' }); // Get the signing key
    
    // Ensure we are using the key in the correct format
    const token = jwt.sign({ user: 'test-user' }, key.toPEM(true), {
        algorithm: 'RS256',
        keyid: key.kid,    // Include key ID
        expiresIn: expired ? '-1s' : '1h', // Expire immediately if `expired=true`
    });

    res.json({ token });
}

module.exports = { issueToken };
