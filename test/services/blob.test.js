const assert = require('assert');
const app = require('../../src/app');

describe('\'blob\' service', () => {
  it('registered the service', () => {
    const service = app.service('blob');

    assert.ok(service, 'Registered the service');
  });
});
