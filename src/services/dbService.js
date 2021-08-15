import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

export const dbService = {
    getRef
}

const config = {
    apiKey: "AIzaSyCS142LthvcfvYfjWUwc6DTUWpRbVkLr7U",
    authDomain: "e-shop-ad79d.firebaseapp.com",
    databaseURL: 'https://e-shop-ad79d-default-rtdb.europe-west1.firebasedatabase.app/',
    projectId: "e-shop-ad79d",
    storageBucket: "e-shop-ad79d.appspot.com",
    messagingSenderId: "774917610561",
    appId: "1:774917610561:web:c9e1a8d4cc7ac359477ac0"
};

function initFireBase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(config)
    }
}

initFireBase()

function getRef(refName) {
    return firebase.database().ref(refName)
}

