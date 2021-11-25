const objects = require('./objects/objects.service.js');
const blobs = require('./blobs/blobs.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(objects);
  app.configure(blobs);
};
