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
    res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })
  
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
  
    response.status(204).end()
  })

  app.post('/api/persons', (request, response) => {
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

    if (persons.filter(p => p.name === body.name).length > 0) {
        console.log("not unique name")
        return response.status(400).json({ 
          error: 'must have unique name' 
        })
    }

   const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 1000000 + 1)
    }

    persons = persons.concat(person)
    response.json(person)
  })
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })