const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
}

const password = process.argv[2]

const url = `mongodb+srv://ryanmalley101:${password}@cluster0.oev01ay.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

// const person = new Person({
//     name: 'Bernie Sanders',
//     number: '8675309'
// })

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}
else if (process.argv.length === 5) {
    name = process.argv[3]
    number = process.argv[4]
    const person = new Person({
        name: name,
        number: number
    })
    person.save().then(() => {
        console.log('person saved')
        mongoose.connection.close()
    })
}
