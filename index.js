require('dotenv').config();

const Person          = require('./models/person');
const errorHandler    = require('./middlewares/errorHandler');
const unknownEndpoint = require('./middlewares/unknownEndpoint');

const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors')
const app = express();

app.use(express.json());
app.use(cors());

// custom request
app.use(morgan(function (tokens, request, response) {
  let data = '';

  if(tokens.method(request, response) === 'POST') {
    data = JSON.stringify(request.body);
  }

  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    data
  ].join(' ')
}))

app.get('/', (request, response) => {
  response.status(200);
  response.send("<h1>Hello World!!!</h1>");
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(result => {
      response.status(200).json(result);
    })
    .catch(e => next(e));
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then(person => {
      if (person) {
        response.status(200).json(person);
      } else {
        response.status(404).send('Not found');
      }
    })
    .catch(e => next(e));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.phone) {
    return response.status(400).json({
      error: 'Name and phone are required'
    });
  }

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({
          error: `${body.name} already registered.`
        });
      }

      const newPerson = new Person({
        name: body.name,
        phone: body.phone
      });

      newPerson.save()
        .then(savedPerson => {
          response.status(201).json(savedPerson);
        })
        .catch(e => next(e));
    })
    .catch(e => next(e));
});

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  Person.findByIdAndUpdate(id, { phone: body.phone }, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.status(200).json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch(e => next(e));
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id)
    .then(deletedPerson => {
      if (deletedPerson) {
        response.status(204).end();
      } else {
        response.status(404).end();
      }
    })
    .catch(e => next(e));
});

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const dateLocation = new Date();
      response.send(`Phonebook has info for ${count} people <br/> ${dateLocation}`);
    })
    .catch(e => next(e));
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
})

app.use(unknownEndpoint)
app.use(errorHandler)
