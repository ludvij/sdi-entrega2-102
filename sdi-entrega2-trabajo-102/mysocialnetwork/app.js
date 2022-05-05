let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let path = require('path');
let createError = require('http-errors');
let crypto = require("crypto");

let app = express();

let indexRouter = require('./routes/index');

let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

require("./database").connect()


let expressSession = require("express-session");
app.use(expressSession({
    secret: "abcdefg",
    resave: true,
    saveUninitialized: true
}));
app.set("crypto", crypto);
app.set("clave", "abcdefg");

const adminSessionRouter = require("./routes/adminSessionRouter");
app.use("/admin", adminSessionRouter);
const userSessionRouter = require("./routes/userSessionRouter");
app.use("/users", userSessionRouter);
app.use("/friends", userSessionRouter);
app.use("/publications", userSessionRouter);

let userModel = require("./schemas/schema").User
let postModel = require("./schemas/schema").Post
const usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, userModel);
require("./routes/users.js")(app, userModel, usersRepository);
require("./routes/admin.js")(app, userModel);
require("./routes/posts.js")(app, postModel)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use('/', indexRouter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log("Se ha producido un error: " + err);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
