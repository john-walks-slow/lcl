// Initializes the `blobs` service on path `/blobs'

const hooks = require('./blobs.hooks');
// const filters = require('./blobs.filters');


// feathers-blob service
const blobService = require('feathers-blob');
// Here we initialize a FileSystem storage,
// but you can use feathers-blob with any other
// storage service like AWS or Google Drive.
const fs = require('fs-blob-store');


// File storage location. Folder must be created before upload.
// Example: './blobs' will be located under feathers app top level.
const blobStorage = fs('./public/assets/objects');

module.exports = function() {
  const app = this;
  const paginate = app.get('paginate');

  // Initialize our service with any options it requires
  app.use('/blobs', blobService({ Model: blobStorage}));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('blobs');

  service.hooks(hooks);

  // if (service.filter) {
  //   service.filter(filters);
  // }
};
