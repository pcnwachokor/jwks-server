const express = require('express');
const { serveJWKS } = require('./keys');
const { issueToken } = require('./auth');

const app = express();
const PORT = 8080;

//defined root route to handle requests to /
app.get("/", (req, res) => {
    res.send("JWKS Server is running.");
});

// Serve the JWKS route
app.get('/jwks', serveJWKS);

// Auth route to return a signed JWT
app.post('/auth', issueToken);

// Start the server
if(process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
}

module.exports = app;
