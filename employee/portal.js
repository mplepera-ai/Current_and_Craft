// Public Firebase Web SDK settings mirror Jarvis_Hub/src/jarvis/config.ts.
// These are NOT service-account credentials or a backend authorization grant.
// Keep this small entry page on the exact same origin as the built Hub SPA.
import {initializeApp, getApps} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth, GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';

const config = Object.freeze({
  apiKey:'AIzaSyAHcoAlXNgPmTja8AUXUwjj_aWSDrVpiow',
  authDomain:'jarvis-hub-4ae58.firebaseapp.com',
  projectId:'jarvis-hub-4ae58',
  storageBucket:'jarvis-hub-4ae58.firebasestorage.app',
  messagingSenderId:'436661418155',
  appId:'1:436661418155:web:d0eb1fd361811f1a1f9fee',
});
const APP_NAME = 'jarvis-hub-private'; // must match Jarvis_Hub/src/jarvis/auth.ts
const OWNER_UID = 'mmsVWiF2PLQgWuUmPUSDhXp0f4n1'; // public identifier, not permission
const status = document.getElementById('status');
const login = document.getElementById('sign-in');
const logout = document.getElementById('sign-out');
const launch = document.getElementById('launch-hub');

// Only surface Firebase's stable error code, never the raw error message,
// credential details, Google account identifiers or OAuth responses.
function authErrorCode(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  return /^auth\/[a-z0-9-]{1,64}$/.test(code) ? code : 'auth/unknown';
}
function authErrorMessage(code) {
  const hints = {
    'auth/unauthorized-domain': 'The website hostname is not authorized in Firebase Authentication.',
    'auth/popup-blocked': 'Allow Google sign-in popups for currentandcraft.net and retry.',
    'auth/popup-closed-by-user': 'The Google sign-in window closed before completion. Try again.',
    'auth/cancelled-popup-request': 'Another sign-in request interrupted this one. Retry once.',
    'auth/operation-not-allowed': 'Enable the Google sign-in provider in Firebase Authentication.',
    'auth/network-request-failed': 'The browser could not reach Firebase Authentication. Check browser blocking extensions and connectivity.',
    'auth/operation-not-supported-in-this-environment': 'Use a normal HTTPS browser tab rather than an embedded webview.',
    'auth/invalid-api-key': 'The Firebase web configuration must be reviewed.',
  };
  return `Google sign-in failed (${code}). ${hints[code] || 'Check the browser Console for blocked requests or CSP violations.'}`;
}

function show(message, {loginVisible=false, logoutVisible=false, hubVisible=false}={}) {
  status.textContent = message;
  login.hidden = !loginVisible;
  logout.hidden = !logoutVisible;
  launch.hidden = !hubVisible;
  login.disabled = !loginVisible;
}
const firebaseApp = getApps().find(app => app.name===APP_NAME) ?? initializeApp(config, APP_NAME);
const auth = getAuth(firebaseApp);

async function hubInstalled() {
  try {
    const response = await fetch('./hub/ready.json', {cache:'no-store', credentials:'same-origin'});
    if(!response.ok) return false;
    const marker = await response.json();
    return marker?.kind === 'jarvis-hub-static-frontend' &&
      marker?.base === '/employee/hub/';
  } catch {
    return false;
  }
}
login.addEventListener('click', async () => {
  login.disabled = true;
  status.textContent='Opening Google sign-in…';
  try {
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:'select_account'});
    await signInWithPopup(auth,provider);
  } catch (error) {
    const code = authErrorCode(error);
    console.warn('Employee Firebase sign-in error code:', code);
    show(authErrorMessage(code), {loginVisible:true});
  }
});
logout.addEventListener('click', async () => {
  try {await signOut(auth);} catch { show('Unable to sign out. Close the tab and try again.', {logoutVisible:true}); }
});
onIdTokenChanged(auth, async (user) => {
  if (!user) {show('Sign in to continue. Only the enrolled Jarvis owner account is allowed.', {loginVisible:true});return;}
  if(user.uid!==OWNER_UID) {
    try {await signOut(auth);} catch { /* Still hide all private links. */ }
    show('This Google account is not authorized for Jarvis.', {loginVisible:true});
    return;
  }
  if(await hubInstalled()) {
    show('Signed in. Open the private Jarvis dashboard.', {logoutVisible:true,hubVisible:true});
  } else {
    show('Signed in. The Jarvis Hub frontend has not yet been deployed under /employee/hub/. The local server and website are separate setup steps.', {logoutVisible:true});
  }
}, (error) => {
  const code = authErrorCode(error);
  console.warn('Employee Firebase auth-state error code:', code);
  show('Authentication could not be verified (' + code + '). Please retry.', {loginVisible:true});
});
