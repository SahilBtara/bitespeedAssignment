import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { dbQueries } from "./dbSetup.js";

const app = express();
const port = 3000;

const dbPool = new pg.Pool({
  user: "postgres",
  database: "bitespeed",
  port: 5432,
  host: "localhost",
  password: "root",
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/identify", async (req, res) => {
  try {
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;

    // Acquire a connection from the pool
    const client = await dbPool.connect();

    try {
      // Perform database queries using the acquired connection
      await dbQueries(client, email, phoneNumber);
    } finally {
      client.release(); // Release the connection back to the pool
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error identifying user:", error);
    res.status(500).send("An error occurred while identifying user");
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
