import firebase from "firebase";
const firebaseConfig = {
  apiKey: "AIzaSyChu24boQ9j9sfXg3W2dW5j6SqonAuIw3g",
  authDomain: "ethiosocialnetwork.firebaseapp.com",
  projectId: "ethiosocialnetwork",
  storageBucket: "ethiosocialnetwork.appspot.com",
  messagingSenderId: "291199187711",
  appId: "1:291199187711:web:2f9f514e3ab4dc17c42aca",
  measurementId: "G-68NQ5W1YTJ",
};
const fb = firebase.initializeApp(firebaseConfig);
const db = fb.firestore();
const auth = fb.auth();
const storage = fb.storage();
export { db, auth, storage };
