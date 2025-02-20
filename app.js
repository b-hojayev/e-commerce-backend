require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const cookieparser = require("cookie-parser");

//client routers
const authRouter = require("./routes/client/authRouter");
const homeRouter = require("./routes/client/homeRouter");
//admin routers
const adminAuthRouter = require("./routes/admin/adminAuthRouter");
const adminTypeRouter = require("./routes/admin/adminTypeRouter");

//error-handlers
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const authenticationMiddleware = require("./middleware/authentication");
const adminAuthenticationMiddleware = require("./middleware/adminAuthentication");

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieparser());

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/home", authenticationMiddleware, homeRouter);

//admin routes
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/type", adminAuthenticationMiddleware, adminTypeRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

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
