const axios = require('axios');

const server = require('../api_gateway/src/index');


describe('Api Gateway Tests', () => {
  let server;

  beforeAll(() => {
    server = require('../api_gateway/src/index');
  });

  afterAll(() => {
    server.close();
  });

  describe('PUT /state', () => {
    test('should set currentState to PAUSED', async () => {
      const response = await axios.put('http://localhost:8083/state', 'PAUSED', {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      expect(response.status).toBe(200);
    });

    test('should return 400 for invalid state', async () => {
      try {
        await axios.put('http://localhost:8083/state', 'INVALID_STATE', {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /state', () => {
    test('should get the current state', async () => {
      const response = await axios.get('http://localhost:8083/state');
      expect(response.status).toBe(200);
      expect(response.data).toBe('PAUSED');
    });
  });

  // describe('GET /messages', () => {
  //   test('should get the run log', async () => {
  //     const response = await axios.get('http://localhost:8083/messages');

  //     expect(response.status).toBe(200);
  //     expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
  //   });
  // });

  describe('GET /run-log', () => {
    test('should get the run log', async () => {
      const response = await axios.get('http://localhost:8083/run-log');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
    });
  });
});
