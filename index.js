require('dotenv').config();
const Person = require('./models/person');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors());

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

const generateId = () => {
    return Math.floor(Math.random() * 9999);
}

app.get('/', (request, response) => {
    response.status(200);
    response.send("<h1>Hello World!!!</h1>");
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(result => {
            response.status(200).json(result);
        })
        .catch(e => {
            const errorMessage = e.message || 'Internal Server Error';
            response.status(500).json({ error: `Server Failure. ${errorMessage}`});
        }) ;
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    Person.findById(id)
        .then(person => {
            if (person) {
                response.status(200).json(person);
            } else {
                response.status(404).send('Not found');
            }
        })
        .catch(error => {
            console.error('Error finding person:', error);
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

app.post('/api/persons', (request, response) => {
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
                .catch(error => {
                    console.error('error saving person:', error);
                    response.status(500).json({ error: 'Internal Server Error' });
                });
        })
        .catch(error => {
            console.error('error checking existing person:', error);
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

app.put('/api/persons/:id', (request, response) => {
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
        .catch(error => {
            console.error('error updating person:', error);
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    Person.findByIdAndDelete(id)
        .then(deletedPerson => {
            if (deletedPerson) {
                response.status(204).end();
            } else {
                response.status(404).end();
            }
        })
        .catch(error => {
            console.error('Error deleting person:', error);
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(count => {
            const dateLocation = new Date();
            response.send(`Phonebook has info for ${count} people <br/> ${dateLocation}`);
        })
        .catch(error => {
            console.error('Error retrieving document count:', error);
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})

