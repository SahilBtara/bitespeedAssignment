import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { dbQueries } from "./dbSetup.js";

const app = express();
const port = 3000;

const dbPool = new pg.Pool({
  user: "postgres",
  database: "quizapplicationyt",
  port: 5432,
  host: "localhost",
  password: "rishab123",
});

app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/identify", async (req, res) => {
//  console.log(req.body);
  try {
    const email = req.body.email;
    const phoneNumber = req.body.phonenumber;

    if (
      email == null ||
      phoneNumber == null ||
      email == "" ||
      phoneNumber == ""
    ) {
      return res.status(400).send({
        message: "You've entered invalid data",
        description:
          "Both email and phone number should be present and not empty in the request",
      });
    }

    // Acquire a connection from the pool
    const client = await dbPool.connect();
    let response;
    try {
      // Perform database queries using the acquired connection
      response = await dbQueries(client, email, phoneNumber);
   //   console.log(response);
      res.send(response);
    } finally {
      client.release(); // Release the connection back to the pool
    }
  } catch (error) {
    console.error("Error identifying user:", error);
    res.status(500).send("An error occurred while identifying user");
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
