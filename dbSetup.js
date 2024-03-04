import { query } from "express";

export async function dbQueries(db, email, phoneNumber) {
  try {
    // Make two DB calls one with email one with phone number
    const queryResult = await queryByEmailAndPhoneNumber(
      db,
      email,
      phoneNumber
    );
    console.log(queryResult);
    if (queryResult.length === 0) {
      let newRow = await createNew(db, email, phoneNumber, null, "primary");
      return createResponse(newRow[0].id, [email], [phoneNumber], []);
    }

    var entryFoundWithEmail = queryResult.some((obj) => obj.email === email);
    var entryFoundWithNum = queryResult.some(
      (obj) => obj.phonenumber === phoneNumber
    );
    if (!entryFoundWithNum || !entryFoundWithEmail) {
      var linkedId = searchId(queryResult);
      let newRow = await createNew(
        db,
        email,
        phoneNumber,
        linkedId,
        "secondary"
      );
      console.log("New row created", newRow);
      const emailsArray = queryResult.map((obj) => obj.email);
      emailsArray.push(newRow[0].email);
      const phoneArray = queryResult.map((obj) => obj.phonenumber);
      phoneArray.push(newRow[0].phonenumber);
      const secondaryIdArray = queryResult
        .filter((obj) => obj.linkprecedence === "secondary")
        .map((obj) => obj.id);
      secondaryIdArray.push(newRow[0].id);
      return createResponse(
        linkedId,
        emailsArray,
        phoneArray,
        secondaryIdArray
      );
    }

  } catch (error) {
    console.error("Error executing queries:", error);
  }
}

async function queryByEmailAndPhoneNumber(db, email, phoneNumber) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM contacts WHERE email = $1 OR phonenumber = $2",
      [email, phoneNumber],
      (err, res) => {
        if (err) {
          console.log(
            "Error executing the query by phone number and email",
            err.stack
          );
          reject(err);
        } else {
          const data = res.rows;
          resolve(data);
        }
      }
    );
  });
}

function findPrimaryId(queryResult) {
  queryResult.forEach((element) => {
    console.log(typeof element.linkprecedence);
    if (element.linkprecedence === "primary") {
      return element.id;
    }
  });
  return -1;
}

function createResponse(
  primaryContactID,
  emails,
  phoneNumbers,
  secondaryContactId
) {
  let response = {
    contact: {
      primaryContactId: primaryContactID,
      emails: emails,
      phoneNumbers: phoneNumbers,
      secondaryContactId: secondaryContactId,
    },
  };

  return response;
}

async function createNew(db, email, phoneNumber, linkedId, linkprecedence) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO contacts (email, phonenumber, linkedid, linkprecedence, createdat, updatedat)" +
        "VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [email, phoneNumber, linkedId, linkprecedence, new Date(), new Date()],
      (err, res) => {
        if (err) {
          console.log(
            "Error executing the query by phone number and email",
            err.stack
          );
          reject(err);
        } else {
          const data = res.rows;
          resolve(data);
        }
      }
    );
  });
}

function searchId(queryResult) {
  const objWithPrimaryLinkPrecedence = queryResult.find(
    (obj) => obj.linkprecedence === "primary"
  );

  if (objWithPrimaryLinkPrecedence) {
    console.log(objWithPrimaryLinkPrecedence.id);
    return objWithPrimaryLinkPrecedence.id;
  } else {
    console.log('No object with linkprecedence "primary" found.');
  }
}
