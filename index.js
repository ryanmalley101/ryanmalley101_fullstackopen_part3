require('dotenv').config()
const express = require('express');
const app = express()
app.use(express.json())

const morgan = require('morgan')
app.use(morgan('tiny'))
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'))

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

const Person = require('./models/person')

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.json(`<p>Phonebook has info for ${persons.length}</p>
                         <p>${new Date().toString()}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body)
    if(body.name === undefined) {
        return response.status(400).json({
            error:'name missing'
        })
    }
    else {
        Person.find({name: body.name})
            .then((docs) => {
                if (docs.length > 0) {
                    Person.updateOne({name: body.name}, {$set: {number: body.number}})
                        .then((result) => {
                            console.log(result)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }
            })
    }
    if(!body.number) {
        return response.status(400).json({
            error:'phone number missing'
        })
    }
    else {
        Person.findOne({number: body.number})
            .then(() => {
                console.log('phone number must be unique')
                return response.status(400).json({
                    error: 'number must be unique'
                })
            })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    console.log(person)
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const {name, number} = request.body

    // const person = {
    //     name: body.name,
    //     number: body.number
    // }

    Person.findByIdAndUpdate(
        request.params.id,
        {name, number},
        {new: true, runValidators: true, content: 'query'}
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if(error.name === 'ValidationError') {
        return response.status(400).json({error:error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})
