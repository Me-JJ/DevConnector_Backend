const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");

const app = express();

app.use(express.json({ extended: true }));

app.use(cors()); // Use this after the variable declaration

//connec to DB
connectDB();

const PORT = process.env.PORT || 5050;

//define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(PORT, () => {
  console.log("Server started on port : ", PORT);
});
