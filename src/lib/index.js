const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

app.get("/", (res, req)=>{
    res.render('login')
});
app.get("/signup", (res, req)=>{
    res.render('signup')
});

const port = 5000;
app.listen(port, console.log(`Listening on port ${port}`));
