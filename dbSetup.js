import { query } from "express";

export async function dbQueries(db, email, phoneNumber) {
  try {
    // Make two DB calls one with email one with phone number
    const queryResult = await queryByEmailAndPhoneNumber(
      db,
      email,
      phoneNumber
    );
    console.log("queryResult is ",queryResult);
    if (queryResult.length === 0) {
      let newRow = await createNew(db, email, phoneNumber, null, "primary");
      return createResponse(db,newRow[0].id);
    }

    var entryFoundWithEmail = queryResult.some((obj) => obj.email === email);
    var entryFoundWithNum = queryResult.some(
      (obj) => obj.phonenumber === phoneNumber
    );
    var linkedId = searchId(queryResult);
    console.log("linkedId is ",linkedId);
    if (!entryFoundWithNum || !entryFoundWithEmail) {
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
        db,
        linkedId
      );
    }

    const primaryObjectWithEmail = queryResult.find(obj => obj.email === email && obj.linkprecedence === 'primary');
    const createdatValueOfEmail = primaryObjectWithEmail ? primaryObjectWithEmail.createdat : null;

    const primaryObjectWithNumber = queryResult.find(obj => obj.phonenumber === phoneNumber && obj.linkprecedence === 'primary');
    const createdatValueOfNumber = primaryObjectWithNumber ? primaryObjectWithNumber.createdat : null;

    if(createdatValueOfEmail !== null && createdatValueOfNumber !== null){
      const createdAt1 = new Date(createdatValueOfEmail);
      const createdAt2 = new Date(createdatValueOfNumber);
      if(createdAt1 > createdAt2)  {
        let updatedRow = await updateQueryWithEmail(db, email, primaryObjectWithNumber.id);
        console.log("updated row is 1",updatedRow);
        const emailsArray = queryResult.map((obj) => obj.email);
        const phoneArray = queryResult.map((obj) => obj.phonenumber);
        const secondaryIdArray = queryResult
        .filter((obj) => obj.linkprecedence === "secondary")
        .map((obj) => obj.id);
        secondaryIdArray.push(updatedRow[0].id);
        return createResponse(
          db,
          linkedId
      );
      }else{
        let updatedRow = await updateQueryWithNumber(db, phoneNumber,primaryObjectWithEmail.id);
        console.log("updated row is 2",updatedRow);
        const emailsArray = queryResult.map((obj) => obj.email);
        const phoneArray = queryResult.map((obj) => obj.phonenumber);
        const secondaryIdArray = queryResult
        .filter((obj) => obj.linkprecedence === "secondary")
        .map((obj) => obj.id);
        secondaryIdArray.push(updatedRow[0].id);
        return createResponse(
          db,
          linkedId
        );
      }
    }

    return createResponse(
      db,
      linkedId
    );

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

async function updateQueryWithEmail(db, email, linkedId){
  return new Promise ((resolve, reject) => {
    db.query(
      "UPDATE contacts SET linkPrecedence = 'secondary', updatedAt = $2, linkedid = $3 WHERE email = $1 AND linkPrecedence = 'primary'  RETURNING *",
      [email, new Date(), linkedId],
      (err, res) => {
        if (err) {
          console.log("Error executing the query with email:", err.stack);
          reject(err);
        } else {
          const data = res.rows;
          resolve(data);
        }
      }
    );
  });
}

async function updateQueryWithNumber(db, number ,linkedId){
  return new Promise ((resolve, reject) => {
    db.query(
      "UPDATE contacts SET linkPrecedence = 'secondary', updatedAt = $2, linkedid = $3 WHERE phoneNumber = $1 AND linkPrecedence = 'primary' RETURNING *",
      [number, new Date(), linkedId],
      (err, res) => {
        if (err) {
          console.log("Error executing the query with number:", err.stack);
          reject(err);
        } else {
          const data = res.rows;
          resolve(data);
        }
      }
    );
  });
}

async function createResponse(
  db,
  primaryContactID
) {
  let resultById = await queryByLinkedId(db,primaryContactID);
  console.log("****resultById***"  ,resultById);
  let emails = resultById.filter(obj => obj.id===primaryContactID).map(obj => obj.email);
  emails.push(... resultById.filter(obj => obj.linkedid===primaryContactID).map(obj => obj.email));
  let phoneNumbers = resultById.filter(obj => obj.id===primaryContactID).map(obj => obj.phonenumber);
  phoneNumbers.push(... resultById.filter(obj => obj.linkedid===primaryContactID).map(obj => obj.phonenumber));
  let secondaryContactId = resultById.filter(obj => obj.linkedid === primaryContactID).map(obj => obj.id);
  let response = {
    contact: {
      primaryContactId: primaryContactID,
      emails: [...new Set(emails)],
      phoneNumbers: [...new Set(phoneNumbers)],
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

  const objWithPrimaryLinkId = queryResult.find(
    (obj) => obj.linkedid !== null
  );

  if (objWithPrimaryLinkPrecedence) {
    console.log("objWithPrimaryLinkPrecedence " ,objWithPrimaryLinkPrecedence.id);
    return objWithPrimaryLinkPrecedence.id;
  } else if(objWithPrimaryLinkId){
    console.log("objWithPrimaryLinkId ",objWithPrimaryLinkId.linkedid);
    return objWithPrimaryLinkId.linkedid;
  } else{
    console.log('No object with linkprecedence "primary" found.');
  }
}

async function queryByLinkedId(db, linkedId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM contacts WHERE linkedid = $1 OR id = $1",
      [linkedId],
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
