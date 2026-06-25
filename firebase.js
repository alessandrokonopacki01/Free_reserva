import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getStorage }
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMsIZftBOCuiFtvz3d76KHTxDGrxi9HYo",
    authDomain: "free-reserva.firebaseapp.com",
    projectId: "free-reserva",
    storageBucket: "free-reserva.firebasestorage.app",
    messagingSenderId: "237651406510",
    appId: "1:237651406510:web:16128bc07001ee0391473f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);