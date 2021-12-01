const yup = require('yup');
const { disallow } = require('feathers-hooks-common');

const {
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');
const seededRandom = require('../../utils/random');

const schema = yup.object().shape({
  _id: yup.string().required(),
  name: yup.string().ensure(),
  dialog: yup.array().of(yup.string()).required(),
  size: yup.string().matches(/(XXL|XL|L|M|S|XS)/).required(),
  movement: yup.string().matches(/(static|float|flash|wander|bf)/).required(),
  zFactor: yup.number().min(0.2).max(2).required(),
  link: yup.mixed().oneOf([yup.string().url().ensure(), yup.string().max(0).ensure()]),
  isAnimate: yup.boolean().default(false),
  columns: yup.number(),
  rows: yup.number(),
  birthday: yup.date().required(),
  seed: yup.array().length(2).of(yup.number()).required(),
  item: yup.mixed().oneOf([
    yup.object().shape({
      itemId: yup.number(),
      seed: yup.array().length(2).of(yup.number()),
    }),
    yup.boolean()]
  )
});

const trimDialog = (context) => {
  try {
    let linebreakCharacter = '\n';
    if (context.data.dialog.indexOf('\r\n') > -1) {
      linebreakCharacter = '\r\n';
    }
    let sentences = context.data.dialog.split(linebreakCharacter);
    context.data.dialog = sentences.map(s => s.trim()).filter(s => s != "");
    return context;
  }
  catch (error) {
    throw new Error(error);
  }
};



const setTimestamp = name => {
  return async context => {
    context.data[name] = Date.now();

    return context;
  };
};
const setSeed = async context => {
  context.data.seed = [Math.random() * 360, Math.random() ** 0.5];

  return context;
};
const generateItem = async context => {
  context.data.item = false;
  // if (ownItems.includes(context.data._id)) { return; }
  let itemId = Math.floor(Math.random() * 10);
  if (itemId > 4) { return context; }
  let itemDegree = Math.random() * 360;
  let itemDistance = Math.random();
  context.data.item = {
    itemId: itemId,
    seed: [itemDegree, itemDistance]
  };
  return context;
};



schemaCheck = async (context) => {
  console.log(context.data);
  try {
    const valid = await schema
      .isValid(context.data);
  } catch (error) {
    throw new Error(error);
  }
  return context;
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setTimestamp('birthday'), setSeed, trimDialog, generateItem, schemaCheck
    ],
    update: [disallow('external'),],
    patch: [disallow('external'),],
    remove: [disallow('external'),]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
