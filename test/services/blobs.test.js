const assert = require('assert');
const app = require('../../src/app');

describe('\'blobs\' service', () => {
  it('registered the service', () => {
    const service = app.service('blobs');

    assert.ok(service, 'Registered the service');
  });
});
