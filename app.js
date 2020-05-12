const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.route("/")
.get(function(req, res){
    console.log("Get Request in places");
    res.json({message: "It Works"});
});

app.listen(5000, function() {
  console.log("Server started on port 5000");
});