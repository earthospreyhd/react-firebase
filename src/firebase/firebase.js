import firebase from "firebase/app";
import store from "@/Vuex/store";

import "firebase/auth";
const config = {
  apiKey: "AIzaSyCBOySSw3riF7HEgU2rJgp4aONEvxZhwsk",
  authDomain: "vue-firebase-4cc1a.firebaseapp.com",
  databaseURL: "https://vue-firebase-4cc1a.firebaseio.com",
  projectId: "vue-firebase-4cc1a",
  storageBucket: "vue-firebase-4cc1a.appspot.com",
  messagingSenderId: "809699793301"
};
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(`user is ${user.email}`);
    store.commit("setAuthUser", true);
    store.commit("setUserEmail", user.email);
  } else {
    console.log("not signed in");
    store.commit("setAuthUser", false);
  }
});
console.log("firebase initialized");
