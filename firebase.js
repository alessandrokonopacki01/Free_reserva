import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// Import the functions you need from the SDKs you need
const firebaseConfig = {
    apiKey: "AIzaSyAMsIZftBOCuiFtvz3d76KHTxDGrxi9HYo",
    authDomain: "free-reserva.firebaseapp.com",
    projectId: "free-reserva",
    storageBucket: "free-reserva.firebasestorage.app",
    messagingSenderId: "237651406510",
    appId: "1:237651406510:web:16128bc07001ee0391473f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);