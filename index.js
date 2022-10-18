const express = require("express");
const app = express();
const port = 5000;
const CreateRoute = require("./routes/token");
const cors = require("cors");
const connectDB = require("./db/config");
const ProductRoute = require("./routes/Product");
const userRoute = require("./routes/user");
const errorHandlerMiddleware = require("./errors/error");
const notFound = require("./middleware/not-found");
const cookieParser = require("cookie-parser");
const orderRoute = require("./routes/order");
const helmet = require("helmet");
connectDB();
const whitelist = "*";
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);

  next();
});
app.use(cors());
app.use(errorHandlerMiddleware);

//Routes
app.use("/token", CreateRoute);
app.use("/api/v1/admin", ProductRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1", orderRoute);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
