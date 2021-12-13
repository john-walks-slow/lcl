import feathers from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
var app = feathers();
// Connect to a different URL
var restClient = rest();
// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(window.fetch));
let url = process.env.NODE_ENV == 'app' ? 'https://lcl.yu-me.workers.dev/objects' : 'objects';
export const objectService = app.service(url);
