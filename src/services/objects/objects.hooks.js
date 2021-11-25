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
  link: yup.string().url().ensure(),
  birthday: yup.date().required(),
  seed: yup.array().length(2).of(yup.number()).required(),
});

const trimDialog = ({ data }) => {
  try {
    let linebreakCharacter = '\n'
    if (data.dialog.indexOf('\r\n') > -1) {
      linebreakCharacter = '\r\n'
    }
    let sentences = data.dialog.split(linebreakCharacter)
    return sentences.map(s => s.trim()).filter(s => s != "");
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
  const valid = await schema
    .isValid(context.data)
  if (!valid) {
    throw new Error('Invalid Schema');
  } else {
    return context;
  }
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
