const { db, storage } = require("./firebase.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path")
const express = require("express");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const multer = require("multer");
const { FieldValue } = require("firebase-admin/firestore");
const route = require('./routes')

const app = express();
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(morgan('combined')); //HTTP logger
 //Template Engine
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources\\views'));
const port = process.env.PORT || 8383;

route(app);


app.listen(port, () => console.log(`Server has started on ${port}`));
