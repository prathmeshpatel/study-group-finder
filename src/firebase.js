// Initialize Firebase
import firebase from 'firebase'
const config = {
  // apiKey: restricted
  // authDomain: 
  // databaseURL: 
  // projectId: 
  // storageBucket: 
  // messagingSenderId: 
};
firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider(); //google authentication
export const auth = firebase.auth();
export default firebase;
