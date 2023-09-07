let mysql = require("mysql");
let config = {
    // host    : 'localhost',
    // user    : 'root',
    // password: '',
    // database: 'management_system'
  };
  
  // let connection = mysql.createConnection(config);
  // connection.connect((err) => {
  //   if (err) {
  //     console.log("Error occurred", err);
  //   } else {
  //     console.log("Success occurred");
  //   }
  // });
  let connection=5
  module.exports=connection;