var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    methodOverride  = require("method-override");

// mongoose.connect("mongodb://localhost/User");
mongoose.connect(process.env.DATABASEURL);
console.log(process.env.DATABASEURL);

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
            console.log(allUsers);
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
                    } else {
                        console.log(subscriber.email);
                    }
                });     
             }
             if(result)
             console.log("user already present");
         });
         res.redirect("/");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has started.");
});

