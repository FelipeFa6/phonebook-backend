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


let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "phone": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "phone": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "phone": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "phone": "39-23-6423122"
    }
]

const generateId = () => {
    return Math.floor(Math.random() * 9999);
}


app.get('/', (request, response) => {
    response.status(200);
    response.send("<h1>Hello World!!!</h1>");
})

app.get('/api/persons', (request, response) => {
    response.status(200);
    response.send(persons);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id)

    if(person) {
        response.status(200);
        response.send(person);
    }
    response.status(404);
    response.send("not found");
})

app.post('/api/persons', (request, response) => {

    const body = request.body;

    if(!body.name){
        return response.status(400).json({
            error: "name missing"
        })
    }
    if(!body.phone){ 
        return response.status(400).json({
            error: "phone missing"
        })
    }

    if(persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: `${body.name} already registered.`
        })
    }

    const person = {
        "id": generateId(),
        "name": body.name,
        "phone": body.phone,
    }

    persons = persons.concat(person);
    response.status(200);
    response.json(person);
});

app.put('/api/persons/:id', (request, response) => {
    const body = request.body;
    const id = Number(request.params.id);

    const personIndex = persons.findIndex(person => person.id === id);

    if (personIndex !== -1) {
        const updatedPerson = {
            ...persons[personIndex],
            phone: body.phone,
        };

        persons[personIndex] = updatedPerson;

        response.status(200);
        response.send(updatedPerson);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const filtered = persons.filter(person => person.id !== id);
    console.log(filtered)

    response.status(204);
    response.send(filtered);
})

app.get('/info', (request, response) => {
    const entries = persons.length;
    const date_location = new Date();
    response.send(`Phonebook has info for ${entries} people <br/> ${date_location}`);
})

const PORT =3001
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})

