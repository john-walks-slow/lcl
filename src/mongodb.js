const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  const connection = app.get('mongodb')
  const database = 'lcl'
  const mongoClient = MongoClient.connect(connection, {
    useNewUrlParser: true,
  }).then((client) => client.db(database))
  app.set('mongoClient', mongoClient)
}
