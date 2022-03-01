const jwt = require("jsonwebtoken");
const { connectDb } = require("./dbConnect");

exports.createUser = (req, res) => {
  //first, let's do validation...(email, password)
  if (!req.body || !req.body.email || !req.body.password) {
    //invalid request
    res.status(400).send({
      success: false,
      message: "Invalid Request",
    });
    return;
  }
  const newUser = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    isAdmin: false,
    userRole: 5,
  };
  const db = connectDb();
  db.collection("users")
    .add(newUser) //forcing shape of new user >> .add(newUser)
    .then((doc) => {
      const user = {
        // this will become payload for our jwt
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5,
      };
      ////TODO:create a jwt & send back token
      res.status(201).send({
        success: true,
        message: "Account created",
        token: user, //add this to token later
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};
exports.loginUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    //invalid request
    res.status(400).send({
      success: false,
      message: "Invalid Request",
    });
    return;
  }
  const db = connectDb();
  db.collection("users")
    .where("email", "==", req.body.email.toLowerCase())
    .where("password", "==", req.body.password)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        //bad login
        res.status(401).send({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }
      //good login
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });
      res.send({
        success: true,
        message: "Login Successful",
        token: users[0],
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};

exports.getUsers = (req, res) => {
  //TODO protect route with JWT
  const db = connectDb();
  db.collection("users")
    .get()
    .then((snapshot) => {
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });
      res.send({
        success: true,
        message: "users returned",
        users, //same as saying users:users
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};
