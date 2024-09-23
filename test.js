const request = require('supertest');
const app = require('./app'); // Import the Express app
const jwt = require('jsonwebtoken'); // Add this for token decoding

describe('JWKS Server Tests', () => {
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

    it('should return a valid JWT on POST /auth', function(done) {
        this.timeout(5000);
        request(app)
            .post('/auth')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                const token = res.body.token;
                if (!token) return done(new Error('Token not found'));
                // Add more assertions here if needed
                done();
            });
    });

    it('should return an expired JWT if expired=true', function(done) {
        this.timeout(5000); // Set timeout to 5000ms
        request(app)
            .post('/auth?expired=true')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err) return done(err);
                const token = res.body.token;
                if (!token) return done(new Error('Token not found'));
                // Add more assertions here if needed
                done();
            });
    });
});
