const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mainPepper: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  heat: {
    type: Number,
    required: true,
  },
  likes: {
    type: Number,
  },
  dislikes: {
    type: Number,
  },
  usersLiked: [{ type: Schema.Types.ObjectId, ref: "User" }],

  usersDisliked: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Sauce", userSchema);
