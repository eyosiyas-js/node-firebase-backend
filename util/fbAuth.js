import admin from "firebase-admin";
import { db } from "./firebase.js";
const firebaseConfig = {
  apiKey: "AIzaSyChu24boQ9j9sfXg3W2dW5j6SqonAuIw3g",
  authDomain: "ethiosocialnetwork.firebaseapp.com",
  projectId: "ethiosocialnetwork",
  storageBucket: "ethiosocialnetwork.appspot.com",
  messagingSenderId: "291199187711",
  appId: "1:291199187711:web:2f9f514e3ab4dc17c42aca",
  measurementId: "G-68NQ5W1YTJ",
};

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "ethiosocialnetwork",
    private_key_id: "7a074c02547f8a081533b4443f5011e4d3ac9aef",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC0lvemgPVWPA9s\ngtDTFuugPr3DY7IwFvaM5VrqkAiZGURPfGPl1XieraY87esCTwRV0R5kpW6lw/OL\nwe/GhHgB9ueK4s61f0K2uB0HY3RAvfwzniEwLfK/JvARzQ36FRLd5fXagO3tyIIi\n9XY3J+9Dp3Pv7A7btE/Xzsi3d/A8+9B70ZryyAsS9oJrDyO1rRNGLakPHKjRkpoW\n88Mktbflhc596H6bf8nXViP7XUPu/jmQtd931T9ez6e47g8IeynFMxR53Quixymv\nA4sfIhY/7ErXCuYW+bqQgyQOU22lttz8bCXUFco3AX/ybU4ws+66X/hWEOc4gsXm\nQop/Dr9zAgMBAAECggEAOkV4dc6o24GXzIDNlz+PGm8EVnbl+WR/e+lKE+QUEiq4\nAxn1NiVSvYj02jY/HciXcoV+1CUZdf2rqY4Tq6/09VVRU1xqLOB6i3EPVOH/kiB7\nr8A3n09EQ+/xiRzshKSmKNnaIf52R8LqUxN3aMbHCsKOw30dMkGVfeJom+Lkrxha\n244iwWGczSWBHyHfj7gJXTIQTQXqlw94HOWyWznx57qOozDs/HW+0n0hy5iXVLAg\nFZSlRkSop4ui+KANzVEKuhOmOf1dDwLnWOUJePBKBKJNfmiu6GqqAaJi63nWJYNj\nC7Ri7GM1YnIEqMWIaFfJW+/jd0258KWxQGLuoIHyQQKBgQDqsff538a0+v5ABoAv\nCB3CUgFV+gFGTPbbZ2Tx38L6/Lq2KfVoqha2llaPDTv2wJTasP3cqtZqzNuKm994\neLLGX/csu3a9y3jArqJHI4z5EXakuoSYcKZB/WZKA+SzMAsE4o1iW9ikzRkRloXj\nFiMb1l0CuSOHesEcnuUVRWOOYQKBgQDE+6c3lzg4tC2w2ZWqgtTZvu1LyzLmG43Y\nawquJsoGVaeVoBZ7EdU2W5ItxLYw2bn5LVssfnRH+L1m0nkmVkUyqARMyFfo5hyw\nBCPikXRR8HAgikwbci4CvvR11MVQKsRBMJl5jgcPe3fuZE2TljxOHkkbdx5jHT0n\nMIgLtNNWUwKBgAXek4wNO6P1Dvy87OHAOzZL5LqouPVwIVBVYqHl7bNnNKgvnnKS\npmTEl7+WHiTKpi5d9Mta/mfHXco2ob0aj6YEamMVASA4AXoYI/jRe8oS1LvD6mMB\nljbaRn+dX0/X6L6jh9Oo5l8gvfrBn/GQ8SnWD5ds1+WgfUng82u3w4ihAoGAIw4h\n6Qu5TqYKB5IBR5H27TVEJ5vm1/qJWL1b7jgq9cuigkc2GPrIdd7/+bMrNTBaH1UK\nB7YNXY2Pr0+/jaoGsIgkE8IHmwPwkQZ7mGOITti6K6BRAQVl2MlA2gNehfDGck+C\n0JYM/Z1cb4lcIOq4mrJbEk81ki/u5R2G6IZqoc8CgYAlu0mccLoz2eU4uyxcHR9R\nMWrlze9nrGjHiI5fFohmOw8CRWgidXZgzViDhiHunjZDNUWjcYMGBTY7s8e2F8K4\nm74qvcHZOCAGpmay2qCsZtsMTgSWLOvF8jTrfZzw8pRWuVrhKblSymJFaZfB88vb\naII5e3GTGODd+IflhqGyWA==\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-x9178@ethiosocialnetwork.iam.gserviceaccount.com",
    client_id: "113787342179930358264",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-x9178%40ethiosocialnetwork.iam.gserviceaccount.com",
  }),
  storageBucket: firebaseConfig.storageBucket,
});

const FbAuth = (req, res, next) => {
  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("no token found");
    return res.status(403).json({ error: "unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      console.log(decodedToken);
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch((err) => {
      console.error("error while verifiying the the Token", err);
      return res.status(403).json({ err });
    });
};

export { FbAuth };
