import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    Timestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const botao = document.getElementById("btnPublicar");

botao.addEventListener("click", async () => {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const categoria = document.getElementById("categoria").value;
    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    if (!nome || !telefone || !titulo || !descricao) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        botao.innerText = "Publicando...";
        botao.disabled = true;

        await addDoc(collection(db, "anuncios"), {
            nome,
            telefone,
            categoria,
            titulo,
            descricao,
            cidade: "Reserva",
            status: "ativo",

            instagram: {
                status: "pendente",
                publicado: false
            },

            criadoEm: Timestamp.now(),
            expiraEm: Timestamp.fromMillis(
                Date.now() + (24 * 60 * 60 * 1000)
            )
        });

        alert("Serviço publicado!");
        window.location.href = "index.html";
    }
    catch (error) {
        console.error(error);
        alert("Erro ao publicar");

        botao.innerText = "Publicar Serviço";
        botao.disabled = false;
    }
});