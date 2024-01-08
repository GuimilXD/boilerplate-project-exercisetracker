const mongoose = require("mongoose")

const ExerciseSchema = new mongoose.Schema({
    description: String,
    duration: Number, // In minutes
    date: Date,
})

const Exercise = mongoose.model("Exercise", ExerciseSchema)

module.exports = { Exercise, ExerciseSchema }
