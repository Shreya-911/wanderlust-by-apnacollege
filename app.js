if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const method_override = require("method-override");
const ejs_mate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoutes = require("./routes/user.js");

const dbUrl = process.env.ATLASBD_URL;
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true})); 
app.use(method_override("_method"));
app.engine('ejs', ejs_mate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // time in seconds
});

store.on("error", function(e) {
  console.log("Session store error", e); 
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};



//root route
// app.get("/", (req, res) => {
//   res.send("successfull!");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student123@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "hello world");
//   res.send(registeredUser);
// });


app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "404: Page Not Found"));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("Server is listening");
});