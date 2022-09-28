import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  getPosts,
  postOnePost,
  getPost,
  postComment,
  likePost,
  unLikePost,
  deletePost,
} from "./handlers/posts.js";
import {
  login,
  signUp,
  uploadImage,
  addUserDetails,
  getUserDetails,
  getAuthenticatedUser,
  markNotificationsRead,
} from "./handlers/users.js";
import { FbAuth } from "./util/fbAuth.js";
import multer from "multer";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 9000;
const Multer = multer({ Storage: multer.memoryStorage() });

// basic route
app.get("/", (req, res) => {
  res.status(200).send("Working fine");
});

// post route
app.get("/posts", getPosts);
app.post("/post", FbAuth, postOnePost);
app.get("/post/:postId", getPost);
app.post("/post/:postId/comment", FbAuth, postComment);
app.delete("/post/:postId", FbAuth, deletePost);
app.get("/post/:postId/like", FbAuth, likePost);
app.get("/post/:postId/unlike", FbAuth, unLikePost);

// users route
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FbAuth, Multer.single("file"), uploadImage);
app.post("/user", FbAuth, addUserDetails);
app.get("/user", FbAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FbAuth, markNotificationsRead);
//listener
app.listen(port, () => console.log(`listening on port ${port}`));
