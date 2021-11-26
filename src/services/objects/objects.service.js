// Initializes the `objects` service on path `/objects`
const { Objects } = require('./objects.class');
const hooks = require('./objects.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/objects', new Objects(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('objects');

  service.hooks(hooks);
};
