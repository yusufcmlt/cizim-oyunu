import firebase from "firebase";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCZ_yBIKXc78u0P1zS3Tnp0RpHij9ONaz0",
  authDomain: "cizim-oyunu-database.firebaseapp.com",
  databaseURL: "https://cizim-oyunu-database.firebaseio.com",
  projectId: "cizim-oyunu-database",
  storageBucket: "cizim-oyunu-database.appspot.com",
  messagingSenderId: "1072863200212",
  appId: "1:1072863200212:web:88b75ced3e3634ca94cc41",
  measurementId: "G-Q77QX8K144",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
