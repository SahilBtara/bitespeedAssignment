import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { dbQueries } from "./dbSetup.js";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  database: "bitespeed",
  port: 5432,
  host: "localhost",
  password: "root",
  log: true,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/identify", (req, res) => {
  var email = req.body.email;
  var phoneNumber = req.body.phoneNumber;

  dbQueries(db, email, phoneNumber);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
