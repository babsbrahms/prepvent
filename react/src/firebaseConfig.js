// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMlB026uWQQRf5NM6lRGzrO2C7CwQG_IY",
  authDomain: "prepventapps.firebaseapp.com",
  databaseURL: "https://prepventapps.firebaseio.com",
  projectId: "prepventapps",
  storageBucket: "prepventapps.appspot.com",
  messagingSenderId: "912322599359",
  appId: "1:912322599359:web:88812b36362779d583a90a",
  measurementId: "G-DQPVXBTJ3M"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;