const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const checkAuth= require("./middleware/check-auth");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});
const User = mongoose.model("User", userSchema);

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  author: { type: String, required: true },
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

  .post(async function (req, res, next) {
    const { content, creator, author } = req.body;

    let user;
    try {
      user = await User.findById(creator);
    } catch {
      const error = new HttpError(
        "Creating Comment failed, please try again",
        500
      );
      return next(error);
    }
    if (!user) {
      const error = new HttpError("Could not find user for provided id", 404);
      return next(error);
    }
    const createdComment = new Comment({
      content,
      author,
      creator,
    });
    console.log(user);
    try {
      await createdComment.save();
    } catch (err) {
      const error = new HttpError(
        "Creating a comment failed!, please try again.",
        500
      );
    }
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdComment.save({ session: sess });
      user.comments.push(createdComment); // mongoDB function (not regular push), only adds the comments id
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        "Creating comment failed, please try again",
        500
      );
      return next(error);
    }
    console.log(createdComment);
    res.status(201).json({ comment: createdComment });
  });

/*******************************USERS ROUTE*********************/

app
  .route("/api/users/")

  .get(function (req, res) {
    User.find({}, "-password", function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else if (foundUsers) {
        if (foundUsers.length === 0) {
          res.send("No Users Found");
        } else {
          res.json({
            foundUsers: foundUsers.map((user) =>
              user.toObject({ getters: true })
            ),
          });
        }
      }
    });
  });

/*******************************COMMENTS ROUTE*********************/

app
  .route("/api/:cid")

  /*******************************FETCH A COMMENT*********************/
  .get(async function (req, res, next) {
    const commentId = req.params.cid;
    let edittedComment;
    try {
      edittedComment = await Comment.findById(commentId);
    } catch (err) {
      const error = new HttpError(
        "Something Went Wrong, Could not find comment",
        500
      );
      return next(error);
    }
    if (!edittedComment) {
      const error = new HttpError(
        "Could not find a comment with the selected id.",
        404
      );
      return next(error);
    }
    res.json({ edittedComment: edittedComment.toObject({ getters: true }) });
  })
  /*******************************EDIT COMMENT*********************/
  .patch(async function (req, res, next) {
    const content = req.body.content;
    const commentId = req.params.cid;
    let foundComment;
    try {
      foundComment = await Comment.findById(commentId);
    } catch (err) {
      const error = new HttpError(
        "Something Went Wrong, Could not find comment",
        500
      );
      return next(error);
    }
    if (!foundComment) {
      const error = new HttpError(
        "Could not find a comment with the selected id.",
        404
      );
      return next(error);
    }
    foundComment.content = content;
    try {
      await foundComment.save();
    } catch (err) {
      const error = new HttpError("Comment Edit Failed, please try again,");
    }
    res
      .status(200)
      .json({ foundComment: foundComment.toObject({ getters: true }) });
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

  .post(async function (req, res, next) {
    const { email, password } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        "Logging in failed, please try again later.",
        500
      );
      return next(error);
    }
    if (!existingUser) {
      const error = new HttpError("Invalid Username or Password", 401);
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError("Login Failed. Please try again.", 500);
      return next(error);
    }
    if (!isValidPassword) {
      const error = new HttpError("Invalid Username or Password", 401);
      return next(error);
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
        "ali_coformatique_secret",
        { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new HttpError(
        "logging in failed, please try again later.",
        500
      );
      return next(error);
    }

    res.json({
      userId: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      token: token,
    });
  });

/*******************************SIGNUP ROUTE*********************/

app.route("/api/signup").post(async function (req, res, next) {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing Up failed!, please try again later.",
      500
    );
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
     hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    comments: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      "ali_coformatique_secret",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    token: token,
  });
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An uknown error occurred" });
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
