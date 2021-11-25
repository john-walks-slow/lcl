yup = require('yup');

const {
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');

const schema = yup.object().shape({
  _id: yup.string().required(),
  name: yup.string().ensure(),
  dialog: yup.array().of(yup.string()).required(),
  size: yup.string().matches(/(XL|L|M|S|XS)/).required(),
  movement: yup.string().matches(/(static|float|flash|wander|bf)/).required(),
  zFactor: yup.number().min(0.2).max(2).required(),
  link: yup.mixed().oneOf([yup.string().url().ensure(),yup.string().max(0).ensure()]),
  isAnimate: yup.boolean().default(false),
  columns: yup.number(),
  rows: yup.number(),
  birthday: yup.date().required(),
  seed: yup.array().length(2).of(yup.number()).required(),
});

const trimDialog = (context) => {
  try {
    let linebreakCharacter = '\n'
    if (context.data.dialog.indexOf('\r\n') > -1) {
      linebreakCharacter = '\r\n'
    }
    let sentences = context.data.dialog.split(linebreakCharacter)
    context.data.dialog = sentences.map(s => s.trim()).filter(s => s != "");
    return context;
  }
  catch (error) {
    throw new Error(error)
  }
}



const setTimestamp = name => {
  return async context => {
    context.data[name] = Date.now();

    return context;
  }
}
const setSeed = async context => {
  context.data.seed = [Math.random() * 360, Math.random() ** 0.5];

  return context;
}



schemaCheck = async (context) => {
  console.log(context.data);
  try {
    const valid = await schema
    .isValid(context.data)
  } catch (error) {
    throw new Error(error);
  }
    return context;
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setTimestamp('birthday'), setSeed, trimDialog, schemaCheck
    ],
    update: [],
    patch: [],
    remove: []
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
