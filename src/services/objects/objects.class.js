const { Service } = require('feathers-mongodb')

exports.Objects = class Objects extends Service {
  constructor(options, app) {
    super(options)

    app.get('mongoClient').then((db) => {
      this.Model = db.collection('objects')
    })
  }
}
