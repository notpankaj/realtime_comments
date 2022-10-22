function dbConnect() {
  // Db connection
  const mongoose = require("mongoose");

  const DB_URI = "mongodb://localhost/comments";

  mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on("error", (err) => {
    console.log("err", err);
  });
  mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected");
  });
}

module.exports = dbConnect;
