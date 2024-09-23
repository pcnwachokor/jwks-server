const request = require('supertest');
const app = require('./app'); // Import the Express app
const jwt = require('jsonwebtoken'); // For decoding JWTs

describe('JWKS Server Tests', function () {
    this.timeout(10000); // Increase timeout to 10 seconds to ensure async completion

    it('should return JWKS with keys', (done) => {
        request(app)
            .get('/jwks')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it('should return a valid JWT on POST /auth', function (done) {
        request(app)
            .post('/auth')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                const token = res.body.token;
                if (!token) return done(new Error('Token not found'));
                done();
            });
    });

    it('should return an expired JWT if expired=true', function (done) {
        request(app)
            .post('/auth?expired=true')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                const token = res.body.token;
                if (!token) return done(new Error('Token not found'));
                
                // Decode the token to check if it's expired
                const decoded = jwt.decode(token);
                if (decoded.exp && Date.now() / 1000 < decoded.exp) {
                    return done(new Error('Token is not expired'));
                }
                done();
            });
    });
});
