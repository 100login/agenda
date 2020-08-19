const express = require('express')
const app = express()
var morgan = require('morgan')

let persons = [
  {
    id: 3,
    name: "Liege",
    phone: "65445465"
  },
  {
    id: 4,
    name: "Leandro",
    phone: "3213"
  }
]

const cors = require('cors')

app.use(cors())

app.use(express.json())

app.use(express.static('build'))

app.use(morgan('tiny'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.phone) {
    return response.status(400).json({
      error: 'phone or name  missing'
    })
  }

  const personExist = persons.find(person => person.name === body.name)

  if (personExist) {
    return response.status(400).json({
      error: 'person exist'
    })
  }

  const person = {
    name: body.name,
    phone: body.phone,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/info', (req, res) => {
  now = new Date
  res.send(
    '<span>Phonebook has info for ' + persons.length + ' peoples </span> <br/><br/>'
    + now.toString()
    
  )
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})