var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    methodOverride  = require("method-override");
const nodemailer = require('nodemailer');

mongoose.connect("mongodb://localhost/User");
// mongoose.connect(process.env.DATABASEURL);

var userSchema = new mongoose.Schema({
    email: String
});

var User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "I love node.js",
    resave: false,
    saveUninitialized: false
}));

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("index");
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/practices", function(req, res){
    res.render("practices");
});

app.get("/lawyers", function(req, res){
    res.render("lawyers");
});

app.get("/news", function(req, res){
    res.render("news");
});

app.get("/singlepost", function(req, res){
    res.render("singlepost");
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.get("/subscribe", function(req, res) {
    User.find({}, function(err, allUsers){
        if(err){
            console.log(err);
        } else {
            res.render("subscribers",{users:allUsers});
        }
    });
});

app.post("/subscribe", function(req, res){
    var mail = req.body.Email,
         sub = {email: mail};
         User.findOne({email: mail},function(err, result){
             if(err){
                 console.log(err);
             } 
             if(!result) {
                    User.create(sub, function(err, subscriber){
                    if(err){
                        console.log(err);
                    } 
                });     
             }
         });
         res.redirect("/");
});













//***************************************************************************************











app.put('/send/:mail', (req, res) => {
  const output = `
    <p>I would just like to say once again how excited I am about the prospect of putting my skills and experience in consulting to use on one of your projects and making a positive contribution</p>
  `;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'testinternnode@gmail.com', // generated ethereal user
        pass: 'internskay'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Nodemailer Contact" <testinternnode@gmail.com>', // sender address
      to: req.params.mail, // list of receivers
      subject: 'Node Contact Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }

      res.redirect("/subscribe");
  });
  });












// *****************************************************************************************















app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has started.");
});

