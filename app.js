const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

/*******************************DUMMY COMMENT*********************/

let DUMMY_COMMENTS = [
  {
    id: "c1",
    creator: "Ali",
    content: "Congratulations!",
  },
];

/*******************************DUMMY USERS*********************/

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Ali Sadek",
    email: "AliSadek95@gmail.com",
    password: "Password",
  },
];


/*******************************HOME ROUTE*********************/

app
  .route("/api/")

  .get(function (req, res, next) {
    res.send(DUMMY_COMMENTS);
  })

  .post(function (req, res, next) {
    const { id, content, creator } = req.body;
    const createdComment = {
      id,
      content,
      creator,
    };
    DUMMY_COMMENTS.push(createdComment);
    res.status(201).json({ comment: createdComment });
  });

/*******************************USERS ROUTE*********************/

app
  .route("/api/users/")

  .get(function (req, res) {
    res.json({ user: DUMMY_USERS });
  });

/*******************************COMMENTS ROUTE*********************/

app
  .route("/api/:cid")

  .get(function (req, res, next) {
    const commentId = req.params.cid;
    const comment = DUMMY_COMMENTS.find((c) => {
      return c.id === commentId;
    });
    res.json({ comment });
  })

  .patch(function (req, res, next) {
    const content = req.body.content;
    const commentId = req.params.cid;
    const updatedComment = DUMMY_COMMENTS.find((c) => {
      c.id === commentId;
    });
    const commentIndex = DUMMY_COMMENTS.findIndex((c) => {
      c.id === commentId;
    });
    updatedComment.content = content;
    DUMMY_COMMENTS[commentIndex] = updatedComment;
    res.status(200).json({ comment: updatedComment });
  })

  .delete(function (req, res, next) {
    const commentId = req.params.cid;
    DUMMY_COMMENTS = DUMMY_COMMENTS.filter((comment) => {
      return comment.id !== commentId;
    });
    res.status(200).json({ comment: "deleted Comment" });
  });

/*******************************LOGIN ROUTE*********************/

app
  .route("/api/login")

  .post(function (req, res, next) {
    const { email, password } = req.body;
    const foundUser = DUMMY_USERS.find((user) => {
      return user.email === email;
    });
    if (!foundUser || foundUser.password !== password) {
      res.send("Cannot find User");
    }

    res.json({ message: "Logged in!" });
  });

/*******************************SIGNUP ROUTE*********************/

app.route("/api/signup").post(function (req, res, next) {
  const { id, name, email, password } = req.body;
  const existingUser = DUMMY_USERS.find(user=>{return user.email ===email});
  if(existingUser){
      res.send("User Already Exists!")
  }
  const newUser = { id, name, email, password };
  DUMMY_USERS.push(newUser);
  res.status(201).json({ user: newUser });
});

app.listen(5000, function () {
  console.log("Server started on port 5000");
});
