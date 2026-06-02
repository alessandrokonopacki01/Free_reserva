import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "123456",
    appId: "123456"
};
const app =
    initializeApp(firebaseConfig);
export const db =
    getFirestore(app);