const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./app');  // Assuming app.js contains the Express app
const { expect } = require('chai');

// Set up secret key for decoding JWTs
const secretKey = '3ba010226cd84939b9eed91aa6bd9519';

// Test for valid JWT authentication
describe('JWT Authentication Tests', () => {

    it('should return a valid JWT', async () => {
        const response = await request(app).post('/auth');
        expect(response.statusCode).to.equal(200);
        const token = response.body.token;
        const decoded = jwt.decode(token);
        expect(decoded).to.have.property('exp');
        expect(decoded.exp).to.be.above(Math.floor(Date.now() / 1000));  // Token should not be expired
    });

    // Test to ensure the JWT returned is expired
    it('should return an expired JWT', async () => {
        const response = await request(app).post('/auth?expired=true');
        const token = response.body.token;

        const decoded = jwt.decode(token, { complete: true });
        expect(decoded.payload.exp).to.not.be.null;
        const expiredTokenData = jwt.decode(token, { complete: true });
        expect(expiredTokenData.payload.exp).to.be.below(Math.floor(Date.now() / 1000));  // Token is expired
    });

    // Test that ensures valid JWT's `kid` is found in the JWKS
    it('should have a valid JWK kid found in JWKS', async () => {
        const authResponse = await request(app).post('/auth');
        const token = authResponse.body.token;

        const header = jwt.decode(token, { complete: true }).header;
        const jwksResponse = await request(app).get('/.well-known/jwks.json');
        const jwksKeys = jwksResponse.body.keys;

        const kidList = jwksKeys.map(key => key.kid);
        expect(kidList).to.include(header.kid);  // `kid` should be found in the JWKS
    });

    // Test that expired JWT's `kid` is not found in the JWKS
    it('should not have an expired JWK kid found in JWKS', async () => {
        const authResponse = await request(app).post('/auth?expired=true');
        const token = authResponse.body.token;

        const header = jwt.decode(token, { complete: true }).header;
        const jwksResponse = await request(app).get('/.well-known/jwks.json');
        const jwksKeys = jwksResponse.body.keys;

        const kidList = jwksKeys.map(key => key.kid);
        expect(kidList).to.not.include(header.kid);  // `kid` should not be in the JWKS for expired token
    });

    // Test to make sure JWT `exp` claim is in the past for expired tokens
    it('should have JWT `exp` in the past for expired tokens', async () => {
        const response = await request(app).post('/auth?expired=true');
        const token = response.body.token;

        const decoded = jwt.decode(token, { complete: true });
        const expTimestamp = decoded.payload.exp;
        expect(expTimestamp).to.be.below(Math.floor(Date.now() / 1000));  // The expiration timestamp is in the past
    });

});
