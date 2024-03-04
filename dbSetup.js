export async function dbQueries(db, email, phoneNumber) {
  db.connect();

  try {
    // Make two DB calls one with email one with phone number
    const emailQueryResult = await queryByEmail(db, email);
    const phoneNumberQueryResult = await queryByPhoneNumber(db, phoneNumber);
    console.log(emailQueryResult);
    console.log(phoneNumberQueryResult);
    const queryResult = await queryByEmailAndPhoneNumber(
      db,
      email,
      phoneNumber
    );
    console.log(queryResult);
    // figure out which is primary which is secondary
    // const primaryId = findPrimaryId(emailQueryResult, phoneNumberQueryResult);
    // if both are primary then compare create time
    // if neither then create a new entry
    // find other secondaries linked to the id of primary
    // create response object
    //   var response = {
    //     contact: {
    //       primaryContactId: id,
    //       emails: [],
    //       phoneNumbers: [],
    //       secondaryContactIds: [],
    //     },
    //   };
    // send response
    // Do something with emailQueryResult and phoneNumberQueryResult if needed

    db.end(); // Call db.end() only after both queries are executed
  } catch (error) {
    console.error("Error executing queries:", error);
    db.end(); // Make sure to end the connection even in case of an error
  }
}

async function queryByEmail(db, email) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM contacts WHERE email = $1", [email], (err, res) => {
      if (err) {
        console.error("Error executing query by email:", err.stack);
        reject(err);
      } else {
        const data = res.rows;
        // console.log("Query by email result:", data);
        resolve(data);
      }
    });
  });
}

async function queryByPhoneNumber(db, phoneNumber) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM contacts WHERE phonenumber = $1",
      [phoneNumber],
      (err, res) => {
        if (err) {
          console.error("Error executing query by phone number:", err.stack);
          reject(err);
        } else {
          const data = res.rows;
          //   console.log("Query by phone number result:", data);
          resolve(data);
        }
      }
    );
  });
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
