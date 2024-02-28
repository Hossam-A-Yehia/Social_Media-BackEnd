"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = require("fs");
const bodyParser = require("body-parser");
//For env File
dotenv.config();
const app = express();
const port = process.env.PORT || 2000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "5mb" })); // it will help to recive the data from client side to server in json format
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["*"],
}));
app.use("/", (req, res) => {
    res.json({
        message: "Hello Sir",
    });
});
(0, fs_1.readdirSync)("./routes").map((r) => app.use("/api/auth", require(`./routes/${r}`)));
(0, fs_1.readdirSync)("./routes").map((r) => app.use("/api/post", require(`./routes/${r}`)));
mongoose_1.default
    .connect(process.env.MONGO_SECRET)
    .then(() => {
    console.log("database connected");
    app.listen(port, () => {
        console.log(`Server is Fire at http://localhost:${port}`);
    });
})
    .catch((err) => console.log("DB connection error =>", err));
//# sourceMappingURL=index.js.map