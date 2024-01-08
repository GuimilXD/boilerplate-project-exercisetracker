const mongoose = require("mongoose")
const { ExerciseSchema } = require("./exercise")

const UserSchema = new mongoose.Schema({
    username: String,
    id: mongoose.Types.UUID,
    exercises: [ExerciseSchema],
})

const User = mongoose.model("User", UserSchema)

module.exports = { User }
