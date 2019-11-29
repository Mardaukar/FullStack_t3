require('dotenv').config()

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.use(express.static('build'))

var morgan = require('morgan')
morgan.token('info', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :info'))

const cors = require('cors')
app.use(cors())

const Person = require('./models/person')

let persons = [
    {
        name: "Muumi Muuminen",
        number: "123456",
        id: 1
    },
    {
        name: "Toinen nainen",
        number: "654",
        id: 2
    },
      {
        name: "Kolmas mies",
        number: "555",
        id: 3
      },
  ]
  
  app.get('/info', (req, res) => {
    let count = 0
    Person.find({})
      .then(persons => {
        console.log(persons.length)
        res.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
        `)
    })
  })

  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person.toJSON())
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })
  
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons.map(person => person.toJSON()))
    })
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson.toJSON())
      })
      .catch(error => next(error))
  })

  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  app.post('/api/persons', (request, response, next) => {
    const body = request.body
    
    if (!body.number) {
        console.log("no number")
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }

    if (!body.name) {
        console.log("no name")
        return response.status(400).json({ 
          error: 'name missing' 
        })
    }
    /*
    if (persons.filter(p => p.name === body.name).length > 0) {
        console.log("not unique name")
        return response.status(400).json({ 
          error: 'must have unique name' 
        })
    }
    */
   const person = new Person ({
        name: body.name,
        number: body.number,
        //id: Math.floor(Math.random() * 1000000 + 1)
    })

    person.save().then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

    //persons = persons.concat(person)
    //response.json(person)
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  
  app.use(errorHandler)
  
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })