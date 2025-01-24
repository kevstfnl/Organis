const express = require("express");
const session = require("express-session");
const homeRouter = require("./routers/homeRouter");
const enterpriseRouter = require("./routers/enterpriseRouter");

const app = express();
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "SuperMotDePasse",
    saveUninitialized: true,
    resave: true
}));

app.use(homeRouter);
app.use(enterpriseRouter);


app.use((req, res) => {
    res.status(404).render("pages/404.html.twig");
});

app.listen(3000, (err) => {
    if (err) return console.error(err);
    console.log("Server started at port 3000");
})