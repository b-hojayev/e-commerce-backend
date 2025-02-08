require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");

//routers
const authRouter = require("./routes/auth");
//error-handlers
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/v1/auth", authRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
