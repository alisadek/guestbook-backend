const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true, minlength: 6 },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment"}]
});
const User = mongoose.model("User", userSchema);

const commentSchema = new mongoose.Schema({
  content: { type: String, require: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User"},
});
const Comment = mongoose.model("Comment", commentSchema);



/*******************************HOME ROUTE*********************/

app
  .route("/api/")
  
            /***************FETCH ALL COMMENTS******************/

  .get(function (req, res, next) {
    Comment.find({}, function (err, foundComments) {
      res.send({
        foundComments: foundComments.map((comment) =>
          comment.toObject({ getters: true })
        ),
      });
    });
  })

            /***************CREATE A COMMENT******************/

  .post(function (req, res, next) {
    const { content, creator } = req.body;
    const createdComment = new Comment({
      content,
      creator,
    });
    if (createdComment.content.trim().length === 0) {
      res.send("Comment is empty");
    } else {
        User.findById(creator, async function(err,user){
            if(err){
                console.log(err);
            }
                else{
                    if(!user){
                        res.send("No user exists under that id");
                    }
                    else{
                        const sess = await mongoose.startSession();
                        sess.startTransaction();
                        createdComment.save({session: sess});
                        user.comments.push(createdComment);
                        user.save({session: sess});
                        sess.commitTransaction();
                    }
                }
        });
        }
      res.status(201).json({ comment: createdComment });
    }
  );

/*******************************USERS ROUTE*********************/

app
  .route("/api/users/")

  .get(function (req, res) {
      User.find({}, "-password",function(err, foundUsers){
          if(err){
              console.log(err);
          }
          else  if(foundUsers){
           

            if(foundUsers.length === 0){
                res.send("No Users Found");
            }
              else {

                  res.json({ foundUsers: foundUsers.map(user=> user.toObject({getters:true}))});
              }
            
          }
        
      })
  });

/*******************************COMMENTS ROUTE*********************/

app
  .route("/api/:cid")

  /*******************************FETCH A COMMENT*********************/
  .get(function (req, res, next) {
    const commentId = req.params.cid;
    Comment.findById(commentId, (err, foundComment) => {
      if (err) {
        console.log(err);
      } else {
        if (foundComment) {
          res.json({ foundComment: foundComment.toObject({ getters: true }) });
        } else {
          res.status(404).json("NOT FOUND");
        }
      }
    });
  })
 /*******************************EDIT COMMENT*********************/
  .patch(function (req, res, next) {
    const content = req.body.content;
    const commentId = req.params.cid;
    let comment = Comment.findById(commentId, (err, foundComment) => {
      foundComment.content = content;
      foundComment.save();
      res
        .status(200)
        .json({ foundComment: foundComment.toObject({ getters: true }) });
    });
  })


/*******************************DELETE COMMENT*********************/


  .delete(function (req, res, next) {
    const commentId = req.params.cid;
    Comment.findByIdAndRemove(commentId, function (err, deletedComment) {
      if (err) {
        console.log(err);
      } else {
        console.log("Comment Deleted");
      }
    });
    res.status(200).json({ comment: "deleted Comment" });
  });

/*******************************LOGIN ROUTE*********************/

app
  .route("/api/login")

  .post(function (req, res, next) {
    const { email, password } = req.body;
    User.findOne({email:email}, function(err,foundUser){
        if(err){
            console.log(err);
        }   else if(foundUser){
                if(foundUser.password=== password){
                    res.json({ message: "Logged in!" });
                }
                else{
                    res.send("Invalid Username or Password");
                }
            }

            else{
              res.send("Cannot find User");
        }
    })  
  });

/*******************************SIGNUP ROUTE*********************/

app.route("/api/signup").post(function (req, res, next) {
  const { name, email, password } = req.body;
  User.findOne({ email: email}, function (err, existingUser) {
    if (err) {
      console.log(err);
    } else if (existingUser) {
      res.send("User Already Exists!");
    } else if (
      email.trim().length === 0 ||
      password.trim().length === 0 ||
      name.trim().length === 0
    ) {
      res.send("Data Entered is invalid, please check your data");
    } else if (password.length < 6) {
      res.send("Password length must be at least 6 characters");
    } else {
      const newUser = new User({ name, email, password });
      newUser.save((err));
      res.status(201).json({ user: newUser.toObject({getters:true}) });
    }
  });
});

/**************************Connect*********************/
mongoose
  .connect(
    "mongodb+srv://AliSadek:theguestbook@cluster0-h6z9v.mongodb.net/guestBook?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(5000, function () {
      console.log("Server started on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
