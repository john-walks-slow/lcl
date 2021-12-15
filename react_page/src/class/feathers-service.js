import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
var app = feathers()
// Connect to a different URL
var restClient = rest()
// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(window.fetch))
let url
switch (process.env.BUILD_PLATFORM) {
  case 'web':
    url = 'objects'
    break
  case 'app':
    url = 'https://lcl.yu-me.workers.dev/objects'
    break
  default:
    break
}
export const objectService = app.service(url)
