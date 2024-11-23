import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"; // Corrected import
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyCXWuVrPIJxe8xuojwFKE0yIphonmZ_a0Y",
  authDomain: "chat-appo.firebaseapp.com",
  projectId: "chat-appo",
  storageBucket: "chat-appo.firebasestorage.app",
  messagingSenderId: "825992282479",
  appId: "1:825992282479:web:cff868644b807af254e89a",
  measurementId: "G-S107F21C3M",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I Am Using Chat App",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error.code
      ? error.code.split("/")[1].split("-").join(" ")
      : "An unexpected error occurred";
    toast.error(errorMessage);
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    const errorMessage = error.code
      ? error.code.split("/")[1].split("-").join(" ")
      : "An unexpected error occurred";
    toast.error(errorMessage);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    const errorMessage = error.code
      ? error.code.split("/")[1].split("-").join(" ")
      : "An unexpected error occurred";
    toast.error(errorMessage);
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter Your Email");
    return null;
  }

  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail;
      toast.success("Reset Email Sent");
    } else {
      toast.error("Email doesn't exists");
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export { signup, login, logout, auth, db, resetPass };
