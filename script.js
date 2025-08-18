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
const createPostSec = document.getElementById('create-post');
const postsListSec = document.getElementById('posts-list');
const postsContainer = document.getElementById('posts-container');
const postDetailSec = document.getElementById('post-detail');
const postTitleDet = document.getElementById('post-title-detail');
const postContentDet = document.getElementById('post-content-detail');
const commentsContainer = document.getElementById('comments-container');
const commentInput = document.getElementById('comment-input');
const submitPostBtn = document.getElementById('submit-post');
const submitCmtBtn = document.getElementById('submit-comment');
const backBtn = document.getElementById('back-btn');

let currentPostId = null;
let unsubscribePosts = null;
let unsubscribeComments = null;

// Check if user signed in
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.innerHTML = `<span>Welcome, ${user.email}</span> <button id="logout-btn">Logout</button>`;
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
    loadPosts();
  } else {
    authSection.innerHTML = `<button id="signup-btn">Sign Up</button> <button id="login-btn">Login</button>`;
    document.getElementById('signup-btn').addEventListener('click', doSignup);
    document.getElementById('login-btn').addEventListener('click', doLogin);
  }
});

// Signup
function doSignup() {
  const email = prompt('Enter Email:');
  const password = prompt('Enter Password (min 6 chars):');
  if (email && password) {
    auth.createUserWithEmailAndPassword(email, password)
      .catch(err => alert('Signup Error: ' + err.message));
  }
}

// Login
function doLogin() {
  const email = prompt('Enter Email:');
  const password = prompt('Enter Password:');
  if (email && password) {
    auth.signInWithEmailAndPassword(email, password)
      .catch(err => alert('Login Error: ' + err.message));
  }
}

// Load posts
function loadPosts() {
  if (unsubscribePosts) unsubscribePosts();
  unsubscribePosts = db.collection('posts').orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
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
submitPostBtn.addEventListener('click', () => {
  if (!auth.currentUser) return alert('Please sign in first');
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  if (title && content) {
    db.collection('posts').add({
      title, content, upvotes: 0,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
    });
  }
});

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
  if (unsubscribeComments) unsubscribeComments();
  unsubscribeComments = db.collection(`posts/${postId}/comments`)
    .orderBy('timestamp', 'desc')
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
submitCmtBtn.addEventListener('click', () => {
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
});

// Back button
backBtn.addEventListener('click', () => {
  postDetailSec.style.display = 'none';
  postsListSec.style.display = 'block';
  createPostSec.style.display = 'block';
});
