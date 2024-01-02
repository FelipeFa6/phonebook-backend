const express = require('express');

const app = express();

//import the json file
const persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send("<h1>Hello World!!!</h1>");
})

app.get('/api/persons', (request, response) => {
    response.send(persons);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id)

    if(person) {
        response.send(person);
    }
    response.status(404);
    response.send("not found");
})

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

