import { auth } from "./firebase.js";
import {
    GoogleAuthProvider,
    signInWithPopup
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    Timestamp
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase.js";
const provider = new GoogleAuthProvider();
const btnLogin =
    document.getElementById("btnLogin");
btnLogin.addEventListener("click", async () => {
    try {
        const resultado =
            await signInWithPopup(
                auth,
                provider
            );
        const usuario = resultado.user;
        const usuarioRef =
            doc(db, "usuarios", usuario.uid);

        const usuarioDoc =
            await getDoc(usuarioRef);
        if (!usuarioDoc.exists()) {
            await setDoc(usuarioRef, {
                nome: usuario.displayName,
                email: usuario.email,
                creditos: 5,
                tipo: "profissional",
                criadoEm: Timestamp.now()
            });
        }
        alert(
            "Bem-vindo, " +
            usuario.displayName
        );
    }
    catch (erro) {
        console.error(erro);
        alert("Erro ao fazer login");
    }
});