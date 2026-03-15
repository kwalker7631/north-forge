// firebase.js — Google Sign-In and Firestore connection
// This file never needs to change unless you add new Firebase services.

import { initializeApp }                        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider,
         signInWithPopup, signOut,
         onAuthStateChanged }                   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc,
         setDoc, getDoc, collection,
         addDoc, query, orderBy,
         limit, getDocs }                       from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { NorthLog }                             from './logs/logger.js';

// ── YOUR PROJECT CONFIG ───────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBFdGNW8sEKxOvEpaWbq0r4FB4aBQ7Xz-I",
  authDomain:        "north-forge-ai.firebaseapp.com",
  projectId:         "north-forge-ai",
  storageBucket:     "north-forge-ai.firebasestorage.app",
  messagingSenderId: "943672322270",
  appId:             "1:943672322270:web:0d946347d7e9df192cba4f",
};

// ── INITIALIZE ────────────────────────────────────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);
const provider    = new GoogleAuthProvider();

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const signIn  = () => signInWithPopup(auth, provider);
export const signOut_ = () => signOut(auth);
export const onAuth  = (cb) => onAuthStateChanged(auth, cb);
export const getUser = () => auth.currentUser;

// ── USER PREFERENCES ─────────────────────────────────────────────────────────
// Save: mode, fontSize, sceneIndex, apiKeys (encrypted by Firebase rules)
export const savePrefs = async (userId, prefs) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'prefs'), prefs, { merge: true });
  } catch (e) {
    NorthLog.warn(`savePrefs failed: ${e.message}`);
  }
};

export const loadPrefs = async (userId) => {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'data', 'prefs'));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    NorthLog.warn(`loadPrefs failed: ${e.message}`);
    return null;
  }
};

// ── SAVED PROMPTS ─────────────────────────────────────────────────────────────
// Every time North forges a prompt Ken likes, save it here
export const savePrompt = async (userId, prompt) => {
  try {
    await addDoc(collection(db, 'users', userId, 'prompts'), {
      ...prompt,
      savedAt: new Date().toISOString(),
    });
  } catch (e) {
    NorthLog.warn(`savePrompt failed: ${e.message}`);
  }
};

export const loadPrompts = async (userId, count = 20) => {
  try {
    const q    = query(
      collection(db, 'users', userId, 'prompts'),
      orderBy('savedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    NorthLog.warn(`loadPrompts failed: ${e.message}`);
    return [];
  }
};

// ── EVENT LOG ─────────────────────────────────────────────────────────────────
// Logs AI calls, failures, and key events to Firestore (per-user, auth-gated).
export const logEvent = async (userId, event) => {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'users', userId, 'events'), {
      ...event,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    NorthLog.warn(`logEvent failed: ${e.message}`);
  }
};

// ── CHAT HISTORY ──────────────────────────────────────────────────────────────
// Persists the last 50 messages so the conversation survives refresh & revisits.
export const saveChatHistory = async (userId, msgs) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'chat'), {
      msgs:    msgs.slice(-50),
      savedAt: new Date().toISOString(),
    });
  } catch (e) {
    NorthLog.warn(`saveChatHistory failed: ${e.message}`);
  }
};

export const loadChatHistory = async (userId) => {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'data', 'chat'));
    return snap.exists() ? snap.data().msgs : null;
  } catch (e) {
    NorthLog.warn(`loadChatHistory failed: ${e.message}`);
    return null;
  }
};

// ── USER CHARACTER PROFILE ────────────────────────────────────────────────────
// Sora appearance info: age, build, hair, eyes, style, soraIds, preferredDuration
export const saveProfile = async (userId, profile) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'profile'), profile, { merge: true });
  } catch (e) {
    NorthLog.warn(`saveProfile failed: ${e.message}`);
  }
};

export const loadProfile = async (userId) => {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'data', 'profile'));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    NorthLog.warn(`loadProfile failed: ${e.message}`);
    return null;
  }
};

export const loadEvents = async (userId, count = 20) => {
  if (!userId) return [];
  try {
    const q    = query(
      collection(db, 'users', userId, 'events'),
      orderBy('ts', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    NorthLog.warn(`loadEvents failed: ${e.message}`);
    return [];
  }
};