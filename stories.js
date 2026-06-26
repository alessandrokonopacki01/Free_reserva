import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const listaStories = document.getElementById("listaStories");

const TEMAS = {

  "Construção": {
    classe: "construcao",
    icone: "🔨",
    beneficios: [
      "Obras e reformas",
      "Profissionais qualificados",
      "Orçamento sem compromisso"
    ]
  },

  "Elétrica": {
    classe: "eletricista",
    icone: "⚡",
    beneficios: [
      "Instalações elétricas",
      "Manutenção segura",
      "Atendimento rápido"
    ]
  },

  "Informática": {
    classe: "informatica",
    icone: "💻",
    beneficios: [
      "Suporte técnico",
      "Computadores e redes",
      "Atendimento especializado"
    ]
  },

  "Aulas Particulares": {
    classe: "aulas",
    icone: "📚",
    beneficios: [
      "Aprenda com especialistas",
      "Aulas personalizadas",
      "Resultados de verdade"
    ]
  },

  "Limpeza": {
    classe: "limpeza",
    icone: "🧹",
    beneficios: [
      "Ambiente impecável",
      "Serviço de confiança",
      "Atendimento rápido"
    ]
  },

  "Jardinagem": {
    classe: "jardinagem",
    icone: "🌳",
    beneficios: [
      "Cuidados com seu jardim",
      "Paisagismo",
      "Profissionais locais"
    ]
  },

  "Outros": {
    classe: "servico",
    icone: "💼",
    beneficios: [
      "Profissionais locais",
      "Contato rápido",
      "Confira no site"
    ]
  }

};

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
  const tema = escolherTema(anuncio);

  story.className = `story-modelo ${tema.classe}`;

  document.getElementById("storyIcone").innerText = tema.icone;

  document.getElementById("storyCategoria").innerText =
    anuncio.categoria || "SERVIÇO DISPONÍVEL";

  document.getElementById("storyDescricao").innerText =
    limitarTexto(anuncio.descricao || "Encontre este profissional no Contrata Reserva.", 120);

  document.getElementById("beneficio1").innerText = tema.beneficios[0];
  document.getElementById("beneficio2").innerText = tema.beneficios[1];
  document.getElementById("beneficio3").innerText = tema.beneficios[2];

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

function escolherTema(anuncio) {
  const texto = `
    ${anuncio.categoria || ""}
    ${anuncio.titulo || ""}
    ${anuncio.descricao || ""}
  `.toLowerCase();

  for (const chave in TEMAS) {
    const tema = TEMAS[chave];

   
  }

  return TEMAS.servico;
}

function limitarTexto(texto, limite) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + "...";
}

carregarAnuncios();