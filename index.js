require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const Person = require('./models/person')

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

app.use(cors());

app.use(express.static("build"));

app.use(express.json());

app.use(morgan('tiny'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: "name missing" });
  }
  if (body.phone === undefined) {
    return response.status(400).json({ error: "phone missing" });
  }

  const person = new Person({
    name: body.name,
    phone: body.phone,
  });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => {
      response.json(savedAndFormattedPerson);
    })
    .catch((error) => next(error));

  // Person.findOne({ name: body.name }).then((person) => {
  //   if (person) {
  //     person.phone = body.phone
  //     Person.findByIdAndUpdate(person.id, person, { new: true })
  //       .then((updatedPerson) => {
  //         response.json(updatedPerson);
  //       })
  //       .catch((error) => next(error));
  //   } else {
  //     const person = new Person({
  //       name: body.name,
  //       phone: body.phone,
  //     });

  //     person.save().then((savedPerson) => {
  //       response.json(savedPerson);
  //     });
  //   }
  // });

  // console.log(personExist.name);

  // if (personExist) {
  /*Person.findByIdAndUpdate(request.params.id, note, { new: true })
      .then((updatedNote) => {
        response.json(updatedNote);
      })
      .catch((error) => next(error));*/
  //  }

  /* const person = new Person({
    name: body.name,
    phone: body.phone,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })*/
});

app.get('/info', (req, res) => {
  now = new Date
  res.send(
    '<span>Phonebook has info for ' + persons.length + ' peoples </span> <br/><br/>'
    + now.toString()
    
  )
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})