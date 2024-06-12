require("dotenv").config();
const { db, storage } = require("../../config/db/firebase");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const convertTimestampToDate = require('../utils/converTime');

class UserController {
  //[GET] /user
  async index(req, res, next) {
    const list = [];
    await db
      .collection("users")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const user = new User(
            userData.userID,
            userData.username,
            userData.email,
            userData.role,
            userData.expiredDatePremium,
            userData.signInMethod,
            userData.imageURL
          );
          list.push(user);
        });
      })
      .catch(next);
    res.send(list);
  }

  //[POST] /users
  async create(req, res) {
    try {
      const { userID, username, email, signInMethod, imageURL } = req.body;
      const role = "Normal";
      const expiredDatePremium = "None";
      const newUser = new User(
        userID,
        username,
        email,
        role,
        expiredDatePremium,
        signInMethod,
        imageURL
      );

      console.log(newUser);

      await db.collection("users").add({
        userID: newUser.userID,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        expiredDatePremium: newUser.expiredDatePremium,
        signInMethod: newUser.signInMethod,
        imageURL: newUser.imageURL,
      });

      // const token = newUser.generateAuthToken()

      // //res.send(token);

      // res.header('x-auth-token', token).send("User created successfully");

      res.status(200).send("User created successfully");

      // res.status(201).send("User created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async update(req, res) {
    const userID = req.params.userID;
    const { username } = req.body;
    const file = req.file;

    const fileName = uuidv4(); // Generate a unique filename using UUID
    const destinationFileName = "images/" + fileName; // Use the generated filename

    await storage.bucket().file(destinationFileName).save(file.buffer, {
      contentType: file.mimetype,
    });

    const fileURL = await storage
      .bucket()
      .file(destinationFileName)
      .getSignedUrl({
        action: "read",
        expires: "01-01-3000",
      });

    // Tạo một object JSON chứa các trường cần cập nhật
    const updatedData = {};

    if (username) updatedData.username = username;
    if (fileURL.toString()) updatedData.imageURL = fileURL.toString();

    try {
      // Tìm tài liệu có trường id phù hợp
      const userRef = db.collection("users").where("userID", "==", userID);
      const myUser = await userRef.get();

      if (myUser.empty) {
        res.status(404).send("User not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myUser.docs[0];
      await doc.ref.update(updatedData);

      if (updatedData.imageURL) {
        res.status(200).send(updatedData.imageURL);
      } else {
        res.status(200).send("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async delete(req, res) {
    try {
      const userID = req.params.userID;

      const userRef = db.collection("users").where("userID", "==", userID);
      const myUser = await userRef.get();

      if (myUser.empty) {
        res.status(404).send("User not found");
        return;
      }

      const doc = myUser.docs[0];
      await doc.ref.delete();

      res.status(200).send("User deleted successfully");
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async getUserByID(req, res) {
    const userID = req.params.userID;
    console.log(userID);
    try {
      // Truy vấn dữ liệu người dùng từ Firestore hoặc Realtime Database
      const userRef = db.collection("users").where("userID", "==", userID);
      const myUser = await userRef.get();

      let userData = null;
      myUser.forEach((doc) => {
        userData = doc.data();
      }); // Lấy dữ liệu người dùng từ Firestore

      const newDate = convertTimestampToDate(userData.expiredDatePremium._seconds, userData.expiredDatePremium._nanoseconds);

      userData.expiredDatePremium = newDate;

      res.status(200).json(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  
}

module.exports = new UserController();
