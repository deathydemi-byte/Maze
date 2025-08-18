// === MAZE App JavaScript (using Firebase Compat SDK) ===

// Firebase project configuration
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

// DOM elements
const authSection = document.getElementById('auth-section');
const postsContainer = document.getElementById('posts-container');
const submitPostBtn = document.getElementById('submit-post');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const postDetailSec = document.getElementById('post-detail');
const postsListSec = document.getElementById('posts-list');
const createPostSec = document.getElementById('create-post');
const postTitleDet = document.getElementById('post-title-detail');
const postContentDet = document.getElementById('post-content-detail');
const commentsContainer = document.getElementById('comments-container');
const commentInput = document.getElementById('comment-input');
const submitCmtBtn = document.getElementById('submit-comment');
const backBtn = document.getElementById('back-btn');

let currentPostId = null;

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.innerHTML = `
      <span>Welcome, ${user.email}</span>
      <button id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').onclick = () => auth.signOut();
    loadPosts();
  } else {
    authSection.innerHTML = `
      <button id="signup-btn">Sign Up</button>
      <button id="login-btn">Login</button>
    `;
    document.getElementById('signup-btn').onclick = signup;
    document.getElementById('login-btn').onclick = login;
  }
});

// Signup
function signup() {
  const email = prompt("Enter email:");
  const pass = prompt("Enter password:");
  if (email && pass) {
    auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => alert("Signup error: " + err.message));
  }
}

// Login
function login() {
  const email = prompt("Enter email:");
  const pass = prompt("Enter password:");
  if (email && pass) {
    auth.signInWithEmailAndPassword(email, pass)
      .catch(err => alert("Login error: " + err.message));
  }
}

// Load posts
function loadPosts() {
  db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    postsContainer.innerHTML = '';
    snapshot.forEach(doc => {
      const post = { id: doc.id, ...doc.data() };
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>${post.title} <span>Upvotes: ${post.upvotes || 0}</span></h3>
        <p>${post.content}</p>
      `;
      const upBtn = document.createElement('button');
      upBtn.textContent = 'Upvote';
      upBtn.onclick = () => upvotePost(post.id);
      const viewBtn = document.createElement('button');
      viewBtn.textContent = 'View Comments';
      viewBtn.onclick = () => viewPost(post);
      div.appendChild(upBtn);
      div.appendChild(viewBtn);
      postsContainer.appendChild(div);
    });
  });
}

// Submit post
submitPostBtn.onclick = () => {
  if (!auth.currentUser) return alert('Please sign in first');
  if (postTitle.value && postContent.value) {
    db.collection('posts').add({
      title: postTitle.value,
      content: postContent.value,
      upvotes: 0,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      postTitle.value = '';
      postContent.value = '';
    });
  }
};

// Upvote
function upvotePost(postId) {
  if (!auth.currentUser) return alert('Please sign in first');
  db.collection('posts').doc(postId).update({
    upvotes: firebase.firestore.FieldValue.increment(1)
  });
}

// View post
function viewPost(post) {
  currentPostId = post.id;
  postTitleDet.textContent = post.title;
  postContentDet.textContent = post.content;
  postsListSec.style.display = 'none';
  createPostSec.style.display = 'none';
  postDetailSec.style.display = 'block';
  loadComments(post.id);
}

// Load comments
function loadComments(postId) {
  db.collection(`posts/${postId}/comments`).orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      commentsContainer.innerHTML = '';
      snapshot.forEach(doc => {
        const c = doc.data();
        const div = document.createElement('div');
        div.textContent = c.text;
        commentsContainer.appendChild(div);
      });
    });
}

// Submit comment
submitCmtBtn.onclick = () => {
  if (!auth.currentUser) return alert('Please sign in first');
  if (!currentPostId) return;
  const text = commentInput.value;
  if (text) {
    db.collection(`posts/${currentPostId}/comments`).add({
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      commentInput.value = '';
    });
  }
};

// Back button
backBtn.onclick = () => {
  postDetailSec.style.display = 'none';
  postsListSec.style.display = 'block';
  createPostSec.style.display = 'block';
};
