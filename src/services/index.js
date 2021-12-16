const objects = require('./objects/objects.service.js')
const users = require('./users/users.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(objects)
  app.configure(users)
}
