const express = require('express');
const jwt = require('jsonwebtoken');
const base64url = require('base64url');  // for encoding base64 URL-safe
const app = express();

// Secret key and base64 encoding
const secretKey = '3ba010226cd84939b9eed91aa6bd9519';
const secretKeyBytes = Buffer.from(secretKey, 'utf-8');
const base64EncodedKey = base64url(secretKeyBytes);  // base64url encoding for the JWKS

// Auth route
app.post('/auth', (req, res) => {
    const expired = req.query.expired !== undefined;  // Check if the "expired" query parameter is present

    // Payload data
    let body = {
        Fullname: "username",
        Password: "password",
        iat: Math.floor(Date.now() / 1000),  // Issued at current time
    };

    if (expired) {
        // Expired 10 seconds ago
        body.exp = Math.floor(Date.now() / 1000) - 10;  // Expiration timestamp (10 seconds ago)
        var token = jwt.sign(body, secretKey, { algorithm: 'HS256', header: { kid: '3' } });  // 'kid' is '3' when expired
    } else {
        // Expires in 1 hour
        body.exp = Math.floor(Date.now() / 1000) + 60 * 60;  // 1 hour expiration
        var token = jwt.sign(body, secretKey, { algorithm: 'HS256', header: { kid: '1' } });
    }

    // Return the token as JSON
    res.json({ token });
});

// JWKS endpoint
app.get('/.well-known/jwks.json', (req, res) => {
    // JWKS data
    const jwksData = {
        keys: [
            {
                kty: "oct",
                alg: "HS256",
                k: '3ba010226cd84939b9eed91aa6bd9519',
                kid: "2"
            },
            {
                kty: "oct",
                alg: "HS256",
                k: base64EncodedKey,
                kid: "1",
                use: "sig"
            }
        ]
    };

    // Return the JWKS data as JSON
    res.json(jwksData);
});

// Start the server
app.listen(8080, '127.0.0.1', () => {
    console.log('Server running on http://127.0.0.1:8080');
});
