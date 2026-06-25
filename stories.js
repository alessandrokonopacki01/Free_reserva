import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const listaStories = document.getElementById("listaStories");

async function carregarAnuncios() {
  const q = query(
    collection(db, "anuncios"),
    orderBy("criadoEm", "desc")
  );

  const snapshot = await getDocs(q);

  listaStories.innerHTML = "";

  if (snapshot.empty) {
    listaStories.innerHTML = "<p>Nenhum anúncio encontrado.</p>";
    return;
  }

  snapshot.forEach((doc) => {
    const anuncio = doc.data();

    if (anuncio.instagram && anuncio.instagram.publicado === true) {
      return;
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${anuncio.categoria || "Serviço"}</h2>
      <strong>${anuncio.titulo || ""}</strong>
      <p>${anuncio.descricao || ""}</p>
      <button>Gerar Story</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      gerarStory(anuncio);
    });

    listaStories.appendChild(card);
  });
}

async function gerarStory(anuncio) {
  const story = document.getElementById("storyAnuncio");

  document.getElementById("storyCategoria").innerText =
    anuncio.categoria || "SERVIÇO DISPONÍVEL";

  document.getElementById("storyDescricao").innerText =
    limitarTexto(anuncio.descricao || "Confira no Contrata Reserva.", 130);

  story.style.display = "flex";

  const canvas = await html2canvas(story, {
    width: 1080,
    height: 1920,
    scale: 1,
    backgroundColor: null
  });

  story.style.display = "none";

  const link = document.createElement("a");
  link.download = `story-contrata-reserva-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function limitarTexto(texto, limite) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + "...";
}

carregarAnuncios();