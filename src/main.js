const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const homeRouter = require("./routers/homeRouter");
const enterpriseRouter = require("./routers/enterpriseRouter");
const userRouter = require("./routers/userRouter");
const materialRouter = require("./routers/materialRouter");
const eventRouter = require("./routers/eventRouter");

require('dotenv').config();

const app = express();
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_KEY));
app.use(session({
    secret: process.env.SESSION_KEY,
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 60000
    }
}));

app.use(homeRouter);
app.use(enterpriseRouter);
app.use(userRouter);
app.use(materialRouter);
app.use(eventRouter);


app.use((req, res) => {
    res.status(404).render("pages/404.html.twig");
});

app.listen(3000, (err) => {
    if (err) return console.error(err);
    console.log("Server started at port 3000");
})