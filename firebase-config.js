// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1b2c3d4e5f6g7h8i9j0-k1l2m3n4o5p6q",
    authDomain: "freefiretournament-ca6b8.firebaseapp.com",
    databaseURL: "https://freefiretournament-ca6b8-default-rtdb.firebaseio.com",
    projectId: "freefiretournament-ca6b8",
    storageBucket: "freefiretournament-ca6b8.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
} catch (error) {
    console.log("Firebase already initialized");
}

const database = firebase.database();