require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  const connection = process.env['mongodb']
  const database = process.env['database']
  const mongoClient = MongoClient.connect(connection, {
    useNewUrlParser: true,
  }).then((client) => client.db(database))
  app.set('mongoClient', mongoClient)
}
