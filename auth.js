const jwt = require('jsonwebtoken');
const { keyStore } = require('./keys');

// Issue JWT based on request and key information
async function issueToken(req, res) {
    if (!keyStore) {
        await setupKeys(); // Ensure keys are available
    }

    const expired = req.query.expired === 'true';
    const [key] = keyStore.all({ use: 'sig' }); // Get the signing key
    
    // Issue JWT with expiration handling
    const token = jwt.sign({ user: 'test-user' }, key.toPEM(true), {
        algorithm: 'RS256',
        keyid: key.kid,
        expiresIn: expired ? '-1s' : '1h', // Expire immediately if true
    });

    res.json({ token });
}

module.exports = { issueToken };
