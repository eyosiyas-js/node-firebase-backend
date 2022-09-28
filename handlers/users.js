import { db, auth, storage } from "../util/firebase.js";
import {
  validatersLoginData,
  validatersSignUPData,
  reduceUserDetails,
} from "../util/validaters.js";
import mimeTypes from "mimetypes";
import { v4 as uuid } from "uuid";

import admin from "firebase-admin";
import BusBoy from "busboy";
import fs, { readFileSync } from "fs";
import os from "os";
import path from "path";

import imageToBase64 from "image-to-base64";
import { format } from "url";
const firebaseConfig = {
  apiKey: "AIzaSyChu24boQ9j9sfXg3W2dW5j6SqonAuIw3g",
  authDomain: "ethiosocialnetwork.firebaseapp.com",
  projectId: "ethiosocialnetwork",
  storageBucket: "ethiosocialnetwork.appspot.com",
  messagingSenderId: "291199187711",
  appId: "1:291199187711:web:2f9f514e3ab4dc17c42aca",
  measurementId: "G-68NQ5W1YTJ",
};

//user SignUp
const signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { valid, errors } = validatersSignUPData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This Name is already taken" });
      } else {
        return auth.createUserWithEmailAndPassword(
          newUser.email,
          newUser.password
        );
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        //TODO Append token to imageUrl. Work around just add token from image in storage.
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/ethiosocialnetwork.appspot.com/o/no-img.png?alt=media&token=1fada226-aeec-49c1-ada3-aaad03d3be49`,
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      }
    });
};

// User Login
const login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const { valid, errors } = validatersLoginData(user);
  if (!valid) {
    return res.status(400).json(errors);
  }
  let userData = {};

  auth
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      data.user.getIdToken().then((token) => {
        userData.token = token;
      });
      db.collection("users")
        .where("email", "==", user.email)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            userData.user = doc.data();
          });
          return res.json(userData);
        });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credentials, Please try again" });
    });
};

//Add User Details

const addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      res.status(201).json({ message: "details added" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

//Get any User Details

const getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = [];
        userData.user.push(doc.data());
      } else {
        return res.status(400).json({ error: "user not found" });
      }
    })
    .then(() => {
      db.collection("posts")
        .where("userHandle", "==", req.params.handle)
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
          userData.posts = [];
          data.forEach((doc) => {
            userData.posts.push({
              body: doc.data().body,
              createdAt: doc.data().createdAt,
              userHandle: doc.data().userHandle,
              userImage: doc.data().userImage,
              likeCount: doc.data().likeCount,
              commentCount: doc.data().commentCount,
              postId: doc.id,
            });
          });
          return res.json(userData);
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: err.code });
    });
};

// getAuthenticatedUser
const getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.userCredentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .get();
    })
    .then((data) => {
      userData.notifications = [];

      data.forEach((doc) => {
        userData.notifications.push({
          sender: doc.data().sender,
          recipient: doc.data().recipient,
          postId: doc.data().postId,
          read: doc.data().read,
          type: doc.data().type,
          createdAt: doc.data().createdAt,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// User Upload Profile Image
const uploadImage = (req, res) => {
  const bucket = admin.storage().bucket();
  let token = uuid();
  let file = req.file;
  const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No image file");
      } else {
      }
      let newFileName = `${file.originalname}`;

      let fileUpload = bucket.file(newFileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          metadata: {
            contentType: file.mimeType,
            cacheControl: "public",
            firebaseStorageDownloadTokens: token,
          },
          public: true,
        },
      });

      blobStream.on("error", (error) => {
        reject("Something is wrong! Unable to upload at the moment.");
      });

      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${newFileName}?alt=media&token=${token}`;
        resolve(url);
        db.collection("posts")
          .where("userHandle", "==", req.user.handle)
          .get()
          .then((data) => {
            if (!data.empty) {
              data.forEach((doc) => {
                doc.ref.update({ userImage: url });
              });
            }
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
          });
        db.collection("comments")
          .where("userHandle", "==", req.user.handle)
          .get()
          .then((data) => {
            if (!data.empty) {
              data.forEach((doc) => {
                doc.ref.update({ userImage: url });
              });
            }
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
          });
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl: url });
      });

      blobStream.end(file.buffer);
    });
  };
  if (file) {
    uploadImageToStorage(file)
      .then((success) => {
        res.status(200).send({
          status: "image Uploaded successfully",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

const markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: "Notifications marked read" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

export {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
};
