let express = require("express");
let app = express();


let rest = require('request');
app.set('rest',rest);

let jwt = require("jsonwebtoken");
app.set("jwt",jwt);

let expressSession = require('express-session');
app.use(expressSession({
   secret: 'abcdefg',
   resave: true,
   saveUninitialized: true
}));

let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload());
let mongo = require('mongodb');
let swig = require("swig");
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let gestorProductos = require("./modules/gestorProductos.js");
let gestorUsuarios = require("./modules/gestorUsuarios.js");
let gestorChat = require("./modules/gestorChat.js");
gestorUsuarios.init(app,mongo);
gestorProductos.init(app,mongo);
gestorChat.init(app,mongo);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

app.use(express.static("public"));
app.set("port", 8081);
//TODO cambiar al nuevo cluster en mongo
app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.ilutx.mongodb.net:27017,tiendamusica-shard-00-01.ilutx.mongodb.net:27017,tiendamusica-shard-00-02.ilutx.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ctmrkc-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

require("./routes/rusuarios.js")(app,swig,gestorUsuarios, gestorProductos);
require("./routes/rproductos.js")(app,swig,gestorUsuarios, gestorProductos);
require("./routes/rerrores.js")(app, swig);
require("./routes/rapiproductos.js")(app,swig, gestorUsuarios, gestorProductos);

app.get('/', function(req,res){
    //TODO comprobar si el usuario está logueado o no, y de estarlo, su rol, y redirigir en función de ello
});


app.use(function (err, req, res, next) {
    console.log("Error producido: " + err); // Mostramos el error en consola
    if (!res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});





