// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTx_vaJNCgo3jq6S2aYJ2i9mxO1a0Ci70",
  authDomain: "maze-bf7b9.firebaseapp.com",
  projectId: "maze-bf7b9",
  storageBucket: "maze-bf7b9.firebasestorage.app",
  messagingSenderId: "317727866261",
  appId: "1:317727866261:web:ba17fb408634394aa2ca9c",
  measurementId: "G-X2C7Y4917D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('auth-section').innerHTML =
      `<span>Welcome, ${user.email}</span> <button id="logout-btn">Logout</button>`;
    document.getElementById('logout-btn').onclick = () => auth.signOut();
    loadPosts();
  } else {
    document.getElementById('auth-section').innerHTML =
      `<button id="signup-btn">Sign Up</button> <button id="login-btn">Login</button>`;
    setupAuthButtons();
  }
});

// Setup authentication buttons
function setupAuthButtons() {
  document.getElementById('signup-btn').onclick = () => {
    const email = prompt('Enter Email:');
    const password = prompt('Enter Password:');
    if (email && password) {
      auth.createUserWithEmailAndPassword(email, password)
        .catch(error => alert('Signup Error: ' + error.message));
    }
  };
  document.getElementById('login-btn').onclick = () => {
    const email = prompt('Enter Email:');
    const password = prompt('Enter Password:');
    if (email && password) {
      auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert('Login Error: ' + error.message));
    }
  };
}

// Load and display posts
function loadPosts() {
  db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    snapshot.forEach(doc => {
