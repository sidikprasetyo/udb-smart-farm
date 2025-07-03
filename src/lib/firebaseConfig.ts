import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAPx1UbDSlLAuXeWqrxCHt9ANjbWgOzr48",
  authDomain: "databasesensorptpv.firebaseapp.com",
  databaseURL:
    "https://databasesensorptpv-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "databasesensorptpv",
  storageBucket: "databasesensorptpv.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcde123456",
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
