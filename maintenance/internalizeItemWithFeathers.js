const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');
const fetch = require('node-fetch');
const seededRandom = require('../src/utils/random');
const app = feathers();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest('http://localhost:3030');

// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(fetch));

// Connect to the `http://feathers-api.com/messages` service
const objects = app.service('objects');
const generateItem = object => {
  let item = false;
  // if (ownItems.includes(_id)) { return; }
  let itemId = Math.floor(seededRandom(object._id) * 20);
  if (itemId > 4) { return item; }
  let itemDegree = seededRandom(object.birthday.toString()) * 360;
  let itemDistance = seededRandom((object.birthday % 100).toString());
  item = {
    itemId: itemId,
    seed: [itemDegree, itemDistance]
  };
  return item;
};

async function test() {
  let list = await objects.find();
  list.forEach(async o => {
    let item = generateItem(o);

    let result = await objects.patch(o._id, { "item": item });
    console.log(result);
  });
}
test();