const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Password Required!!!');
    process.exit(1);
}

const password = process.argv[2];

const url =
    `mongodb+srv://felipe:${password}@cluster0.pev6hss.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    phone: String,
});

const Person = mongoose.model('Person', personSchema);

// Check if there are enough command line arguments to retrieve or add entries
if (process.argv.length === 3) {
    // Retrieve all entries
    Person.find({}).then((result) => {
        console.log('Phonebook entries:');
        result.forEach((person) => {
            console.log(`${person.name} ${person.phone}`);
        });
        mongoose.connection.close();
    });
} else if (process.argv.length === 5) {
    const name = process.argv[3];
    const phone = process.argv[4];

    const newPerson = new Person({ name, phone });

    newPerson.save().then((result) => {
        console.log(`Added ${name} number ${phone} to phonebook`);
        mongoose.connection.close();
    });
} else {
    console.log('Invalid number of arguments. Usage:');
    console.log('To retrieve all entries: node mongo.js password');
    console.log('To add a new entry: node mongo.js password name phone');
    process.exit(1);
}

