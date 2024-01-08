const express = require('express')
const app = express()
const cors = require('cors')

const { User } = require("./user.js")
const { Exercise } = require("./exercise.js")

const mongoose = require('mongoose')
const { MongoMemoryServer } = require("mongodb-memory-server")

require('dotenv').config()

async function initDB() {
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri())
}

initDB()

app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => {
    const users = await User.find()

    res.json(users)
})

app.post("/api/users", async (req, res) => {
    const { username } = req.body

    const user = User({
        username
    })

    try {
        await user.save()
    } catch (error) {
        res.status(400).json({
            error
        })
        return
    }

    res.json(user)
})

app.post("/api/users/:id/exercises", async (req, res) => {
    const { id } = req.params

    let { duration, date, description } = req.body

    if (!date) {
        date = Date.now()
    }

    const user = await User.findById(id)

    if (!user) {
        res.status(404).json({
            error: "Could not find user"
        })
        return
    }

    const exercise = new Exercise({
        duration,
        date,
        description,
    })

    user.exercises.push(exercise)

    try {
        await user.save()
    } catch {
        res.json({
            error: "Could not add new exercise to user"
        })
    }

    res.json(
        {
            _id: user._id,
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
        }
    )
})

app.get("/api/users/:id/logs", async (req, res) => {
    const { id } = req.params
    const { limit, from, to } = req.query

    let user
    if (isNaN(limit)) {
        user = await User.findById(id)
    } else {
        user = await User.findById(id, {
            exercises: { $slice: parseInt(limit) }
        })
    }

    if (!user) {
        res.status(404).json({
            error: "Could not find user"
        })
        return
    }

    const exercises = []

    user.exercises.filter(ex => {
        if (from) {
            if (ex.date < new Date(from)) {
                return false
            }
        }

        if (to) {
            if (ex.date > new Date(to)) {
                return false
            }
        }

        return true
    }).forEach(ex => {
        exercises.push({
            date: ex.date.toDateString(),
            duration: ex.duration,
            description: ex.description
        })
    })

    res.json({
        username: user.username,
        _id: id,
        count: exercises.length,
        log: exercises
    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
