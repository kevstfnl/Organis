const express = require("express");
const session = require("express-session");
const homeRouter = require("./routers/homeRouter");

const app = express();
app.use(express.static("./public"));
app.use(express.urlencoded({ extended : true}));
app.use(session({
    secret: "SuperMotDePasse",
    saveUninitialized: true,
    resave: true
}));

app.use(homeRouter);

app.listen(3000, (err) => {
    if (err) return console.error(err);
    console.log("Server started at port 3000");
})