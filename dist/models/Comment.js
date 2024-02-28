"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Users" },
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Posts" },
    comment: { type: String, required: true },
    from: { type: String, required: true },
    replies: [
        {
            replyId: { type: mongoose_1.default.Schema.Types.ObjectId },
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Users" },
            from: { type: String },
            replyAt: { type: String },
            comment: { type: String },
            created_At: { type: Date, default: Date.now() },
            updated_At: { type: Date, default: Date.now() },
            likes: [{ type: String }],
        },
    ],
    likes: [{ type: String }],
}, { timestamps: true });
exports.default = mongoose_1.default.model("Comments", commentSchema);
//# sourceMappingURL=Comment.js.map