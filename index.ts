import { Request, Response, Application } from "express";
import express = require("express");
import dotenv = require("dotenv");
import cors = require("cors");
import mongoose from "mongoose";
import { readdirSync } from "fs";
import bodyParser = require("body-parser");

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 2000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: "5mb" })); // it will help to recive the data from client side to server in json format
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello Sir",
  });
});
readdirSync("./routes").map((r) =>
  app.use("/api/auth", require(`./routes/${r}`))
);
readdirSync("./routes").map((r) =>
  app.use("/api/post", require(`./routes/${r}`))
);

mongoose
  .connect(process.env.MONGO_SECRET as string)
  .then(() => {
    console.log("database connected");
    app.listen(port, () => {
      console.log(`Server is Fire at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log("DB connection error =>", err));
export default app;
