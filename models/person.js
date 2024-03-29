const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;
console.log('connecting to ', url);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('Failed connecting to MongoDB: ', error.message);
  })

const personSchema = new mongoose.Schema({
  name: {
    minLength: 3,
    required: true,
    type: String
  },
  phone: {
    validate: {
      validator: (value) => {
        const phoneRegex = /^\d{2,3}-\d+$/;
        return phoneRegex.test(value);
      },
      message: 'Invalid phone number format'
    },
    required: true,
    type: String
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema);
