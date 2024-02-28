var mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, min: 6, max: 60 },
    secretQue: { type: String, required: true },
    secretAnswer: { type: String, required: true },
    about: { type: String, default: "" },
    location: { type: String, default: "" },
    profession: { type: String, default: "" },

    phone: { type: Number },
    photo: { type: String, default: "" },

    isOnline: { type: Boolean, default: false },
    views: [{ type: String }],
    friends: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
    requestsFriend: [{ type: String }],
    posts: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
