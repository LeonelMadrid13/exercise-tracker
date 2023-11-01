// imports
const express = require('express')
const app = express()
const cors = require('cors')
const uuid = require('uuid')
const bodyParser = require('body-parser');

// Configure dotenv to load environment variables
require('dotenv').config()

// Basic Configuration
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

let USERS = [];
let EXERCISES = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  if(username === "") return res.json({"error": "username is required"});
  const newUser = {
    "username": username,
    "_id": uuid.v4()
  };
  USERS.push(newUser);
  return res.json(newUser);
});

app.get("/api/users", (req, res) => {
  return res.json(USERS);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id: id } = req.params;
  const { description, duration } = req.body;
  let { date } = req.body;

  const user = USERS.find((user) => user._id == id).username;

  if(!date){
    const currentDate = new Date();
    date = currentDate.toISOString().split('T')[0];
  }

  const newExercise = {
    user,
    description,
    duration: parseInt(duration),
    date,
    "_id": id
  };

  EXERCISES.push(newExercise);
  const updatedUser = { ...USERS.find(user => user._id == id), ...newExercise };

  return res.json(updatedUser);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id: id } = req.params;
  const { from, to, limit } = req.query;
  const user = USERS.find((user) => user._id == id).username;
  let exercises = EXERCISES.filter((exercise) => exercise._id == id);

  if(from && to){
    exercises = exercises.map((exercise) => {
      if(exercise.date > from && exercise.date < to){
        return exercise;
      }
    });
  }

  if(limit){
    exercises = exercises.slice(0, limit);
  }

  let log = {
    username: user,
    count: exercises.length,
    _id: id,
    log: exercises
  };
  return res.json(log);
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
