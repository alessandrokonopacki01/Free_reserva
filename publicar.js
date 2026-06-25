import { db, storage } from "./firebase.js";

import {
    collection,
    addDoc,
    Timestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadString,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const botao = document.getElementById("btnPublicar");

botao.addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const categoria = document.getElementById("categoria").value;
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;

    if (!nome || !telefone || !titulo || !descricao) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        botao.innerText = "Publicando...";
        botao.disabled = true;

        const dadosAnuncio = {
            nome,
            telefone,
            categoria,
            titulo,
            descricao,
            cidade: "Reserva",
            status: "ativo",
            statusInstagram: "pendente",
            criadoEm: Timestamp.now(),
            expiraEm: Timestamp.fromMillis(
                Date.now() + (24 * 60 * 60 * 1000)
            )
        };

        const docRef = await addDoc(
            collection(db, "anuncios"),
            dadosAnuncio
        );

        const imagemBase64 = await gerarImagemStory(dadosAnuncio);

        const caminhoImagem = `stories/${docRef.id}.png`;
        const imagemRef = ref(storage, caminhoImagem);

        await uploadString(imagemRef, imagemBase64, "data_url");

        const urlImagem = await getDownloadURL(imagemRef);

        await addDoc(
            collection(db, "anunciosInstagram"),
            {
                anuncioId: docRef.id,
                categoria,
                titulo,
                descricao,
                imagemStory: urlImagem,
                status: "pendente",
                criadoEm: Timestamp.now()
            }
        );

        alert("Serviço publicado e imagem do story criada!");
        window.location.href = "index.html";
    }
    catch (error) {
        console.error(error);
        alert("Erro ao publicar");
        botao.innerText = "Publicar Serviço";
        botao.disabled = false;
    }
});

async function gerarImagemStory(anuncio) {
    const story = document.getElementById("storyAnuncio");

    document.getElementById("storyCategoria").innerText =
        anuncio.categoria || "SERVIÇO DISPONÍVEL";

    document.getElementById("storyDescricao").innerText =
        limitarTexto(anuncio.descricao || "Confira este anúncio no Contrata Reserva.", 130);

    story.style.display = "flex";

    const canvas = await html2canvas(story, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: null
    });

    story.style.display = "none";

    return canvas.toDataURL("image/png");
}

function limitarTexto(texto, limite) {
    if (texto.length <= limite) {
        return texto;
    }

    return texto.substring(0, limite) + "...";
}