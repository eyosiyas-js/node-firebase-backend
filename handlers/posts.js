import { db } from "../util/firebase.js";
import { reduceComment } from "../util/validaters.js";

const getPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(posts);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: error });
    });
};

const postOnePost = (req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };
  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      const resPost = newPost;
      resPost.postId = doc.id;
      res.json(resPost);
    })
    .catch((error) => {
      res.json({ error: `something went wrong` });
      console.error(error);
    });
};

const getPost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "post not found" });
      }
      postData = doc.data();
      postData.postId = doc.id;

      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data.forEach((doc) => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

const postComment = (req, res) => {
  let body = reduceComment(req.body);
  if (req.body.body.trim() == "") {
    return res.status(400).json({ comment: "Must not be empty" });
  }

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "post not found" });
      }
      const com = {
        postId: req.params.postId,
        createdAt: new Date().toISOString(),
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        body,
      };
      db.collection("comments")
        .add(com)
        .then(() => {
          return db
            .doc(`/posts/${req.params.postId}`)
            .get()
            .then((doc) => {
              return doc.ref.update({
                commentCount: doc.data().commentCount + 1,
              });
            });
        })
        .then(() => {
          db.doc(`/posts/${req.params.postId}`)
            .get()
            .then((doc) => {
              if (req.user.handle !== doc.data().userHandle) {
                db.collection("notifications")
                  .add({
                    recipient: doc.data().userHandle,
                    sender: req.user.handle,
                    postId: req.params.postId,
                    read: false,
                    type: "comment",
                    createdAt: new Date().toISOString(),
                  })
                  .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ error: err });
                  });
              }
            });
          return res.status(201).json(com);
        })
        .catch((err) => {
          console.error(err);
          return res
            .status(500)
            .json({ error: "something went wrong. Please try again later!" });
        });
    });
};

//Like A post
const likePost = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("postId", "==", req.params.postId)
    .limit(1);
  const postDocument = db.doc(`/posts/${req.params.postId}`);
  let postData;
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(400).json({ error: "post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            userHandle: req.user.handle,
            postId: req.params.postId,
          })
          .then(() => {
            postData.likeCount++;
            db.doc(`/posts/${req.params.postId}`).update({
              likeCount: postData.likeCount,
            });
          })
          .then(() => {
            db.doc(`/posts/${req.params.postId}`)
              .get()
              .then((doc) => {
                if (req.user.handle !== doc.data().userHandle)
                  db.collection("notifications")
                    .add({
                      recipient: doc.data().userHandle,
                      sender: req.user.handle,
                      postId: req.params.postId,
                      read: false,
                      type: "like",
                      createdAt: new Date().toISOString(),
                    })
                    .catch((err) => {
                      console.error(err);
                      return res.status(500).json({ error: err });
                    });
              });

            return res.status(200).json(postData);
          });
      } else {
        return res.status(400).json({ error: "post already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

const unLikePost = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("postId", "==", req.params.postId)
    .limit(1);
  const notificationDocument = db
    .collection("notifications")
    .where("sender", "==", req.user.handle)
    .where("postId", "==", req.params.postId)
    .limit(1);
  const postDocument = db.doc(`/posts/${req.params.postId}`);
  let postData;
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(400).json({ error: "post not found" });
      }
    })
    .then((data) => {
      if (!data.empty) {
        return db
          .doc(`likes/${data.docs[0].id}`)
          .delete()

          .then(() => {
            postData.likeCount--;
            db.doc(`/posts/${req.params.postId}`).update({
              likeCount: postData.likeCount,
            });
          })
          .then(() => {
            postDocument
              .get()
              .then(() => {
                return notificationDocument.get();
              })
              .then((data) => {
                if (!data.empty) {
                  db.doc(`/notifications/${data.docs[0].id}`).delete();
                }
              })
              .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: err });
              });

            return res.status(200).json(postData);
          });
      } else {
        return res.status(400).json({ error: "Post Not Liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

const deletePost = (req, res) => {
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "post not found" });
      } else {
        if (req.user.handle !== doc.data().userHandle) {
          return res.status(403).json({ error: "unAuthorized" });
        } else {
          doc.ref.delete();
          db.collection("notifications")
            .where("postId", "==", doc.id)
            .get()
            .then((data) => {
              data.forEach((doc) => {
                doc.ref.delete();
              });
            });
          db.collection("likes")
            .where("postId", "==", doc.id)
            .get()
            .then((data) => {
              data.forEach((doc) => {
                doc.ref.delete();
              });
            });
          db.collection("comments")
            .where("postId", "==", doc.id)
            .get()
            .then((data) => {
              data.forEach((doc) => {
                doc.ref.delete();
              });
            });
          return res.status(200).json({ message: "successfully deleted" });
        }
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

export {
  getPosts,
  postOnePost,
  getPost,
  postComment,
  likePost,
  unLikePost,
  deletePost,
};
