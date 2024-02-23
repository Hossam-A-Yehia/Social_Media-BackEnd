var mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requestTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    requestFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    requestStatus: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("FriendRequest", requestSchema);
