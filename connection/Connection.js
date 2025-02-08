const mongoose = require("mongoose");

function connection() {
  mongoose
    .connect(
      "mongodb+srv://someswar:Gtj2tSJtodBQeZ6A@cluster0.jslmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then((res) => {
        console.log("Database connected!!");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = connection;
