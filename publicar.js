import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    Timestamp
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const botao =
    document.getElementById("btnPublicar");
botao.addEventListener("click", async () => {
    const nome =
        document.getElementById("nome").value;
    const telefone =
        document.getElementById("telefone").value;
    const categoria =
        document.getElementById("categoria").value;
    const titulo =
        document.getElementById("titulo").value;
    const descricao =
        document.getElementById("descricao").value;
    if (
        !nome ||
        !telefone ||
        !titulo ||
        !descricao
    ) {
        alert("Preencha todos os campos");
        return;
    }
    try {
        await addDoc(
            collection(db, "anuncios"),
            {
                nome,
                telefone,
                categoria,
                titulo,
                descricao,
                cidade: "Reserva",
                status: "ativo",
                criadoEm: Timestamp.now(),
                expiraEm: Timestamp.fromMillis(
                    Date.now() + (24 * 60 * 60 * 1000)
                )
            }
        );
        alert("Serviço publicado!");
        window.location.href = "index.html";
    }
    catch (error) {
        console.error(error);
        alert("Erro ao publicar");
    }
});