import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const listaStories =
  document.getElementById("listaStories");

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

/* ======================================================
   CARREGAR ANÚNCIOS PENDENTES
====================================================== */

async function carregarAnuncios() {
  listaStories.innerHTML =
    "<p>Carregando anúncios...</p>";

  try {
    const consulta = query(
      collection(db, "anuncios"),
      orderBy("criadoEm", "desc")
    );

    const snapshot = await getDocs(consulta);

    listaStories.innerHTML = "";

    if (snapshot.empty) {
      listaStories.innerHTML =
        "<p>Nenhum anúncio encontrado.</p>";

      return;
    }

    let quantidadePendentes = 0;

    snapshot.forEach((documento) => {
      const anuncio = documento.data();
      const id = documento.id;

      if (
        anuncio.instagram &&
        anuncio.instagram.publicado === true
      ) {
        return;
      }

      quantidadePendentes++;

      const card = document.createElement("div");
      card.className = "card";

      const categoria =
        anuncio.categoria || "Outros";

      const titulo =
        anuncio.titulo || "Anúncio sem título";

      const descricao =
        anuncio.descricao || "Sem descrição.";

      const status =
        anuncio.instagram?.publicado === true
          ? "🟢 Postado"
          : "🟡 Pendente";

      card.innerHTML = `
        <h2>${escaparHTML(categoria)}</h2>

        <strong>
          ${escaparHTML(titulo)}
        </strong>

        <p>
          ${escaparHTML(descricao)}
        </p>

        <p class="status">
          ${status}
        </p>

        <button
          class="gerar"
          type="button"
        >
          Gerar e publicar Story
        </button>

        <button
          class="postado"
          type="button"
        >
          Marcar como postado
        </button>
      `;

      const botaoGerar =
        card.querySelector(".gerar");

      const botaoPostado =
        card.querySelector(".postado");

      botaoGerar.addEventListener(
        "click",
        async () => {
          await gerarStory(
            anuncio,
            id,
            botaoGerar
          );
        }
      );

      botaoPostado.addEventListener(
        "click",
        async () => {
          await marcarComoPostado(
            id,
            botaoPostado
          );
        }
      );

      listaStories.appendChild(card);
    });

    if (quantidadePendentes === 0) {
      listaStories.innerHTML =
        "<p>Nenhum anúncio pendente de publicação.</p>";
    }

  } catch (erro) {
    console.error(
      "Erro ao carregar os anúncios:",
      erro
    );

    listaStories.innerHTML = `
      <p>
        Não foi possível carregar os anúncios.
      </p>
    `;
  }
}

/* ======================================================
   GERAR E PUBLICAR STORY
====================================================== */

async function gerarStory(
  anuncio,
  id,
  botao
) {
  const story =
    document.getElementById("storyAnuncio");

  if (!story) {
    alert(
      "O modelo do Story não foi encontrado na página."
    );

    return;
  }

  const tema = escolherTema(anuncio);

  const textoOriginal =
    botao.textContent;

  botao.disabled = true;
  botao.textContent =
    "Gerando Story...";

  story.className =
    `story-modelo ${tema.classe}`;

  document
    .getElementById("storyIcone")
    .innerText = tema.icone;

  document
    .getElementById("storyCategoria")
    .innerText =
      anuncio.categoria ||
      "SERVIÇO DISPONÍVEL";

  document
    .getElementById("storyDescricao")
    .innerText =
      limitarTexto(
        anuncio.descricao ||
          "Encontre este serviço no Contrata Reserva.",
        120
      );

  document
    .getElementById("beneficio1")
    .innerText =
      tema.beneficios[0];

  document
    .getElementById("beneficio2")
    .innerText =
      tema.beneficios[1];

  document
    .getElementById("beneficio3")
    .innerText =
      tema.beneficios[2];

  story.style.display = "flex";

  try {
    const canvas = await html2canvas(
      story,
      {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: null,
        useCORS: true
      }
    );

    const imagemBase64 =
      canvas.toDataURL("image/png");

    botao.textContent =
      "Enviando ao Instagram...";

    const resposta = await fetch(
      "/api/publicarStory",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          imagemBase64
        })
      }
    );

    let resultado;

    try {
      resultado =
        await resposta.json();

    } catch {
      throw new Error(
        "A API retornou uma resposta inválida."
      );
    }

    if (
      !resposta.ok ||
      resultado.publicado !== true
    ) {
      console.error(
        "Erro retornado pela API:",
        resultado
      );

      const mensagemErro =
        resultado.erro ||
        resultado.meta?.error?.message ||
        resultado.meta?.error?.error_user_msg ||
        "O Instagram não confirmou a publicação.";

      alert(
        `Erro ao publicar o Story:\n\n${mensagemErro}`
      );

      return;
    }

    await marcarComoPostadoAutomaticamente(
      id,
      resultado
    );

    alert(
      "Story publicado no Instagram com sucesso!"
    );

  } catch (erro) {
    console.error(
      "Erro ao gerar ou publicar Story:",
      erro
    );

    alert(
      `Erro ao gerar ou publicar o Story:\n\n${erro.message}`
    );

  } finally {
    story.style.display = "none";

    botao.disabled = false;
    botao.textContent =
      textoOriginal;
  }
}

/* ======================================================
   MARCAÇÃO AUTOMÁTICA APÓS PUBLICAÇÃO
====================================================== */

async function marcarComoPostadoAutomaticamente(
  id,
  resultado
) {
  if (!id) {
    return;
  }

  await updateDoc(
    doc(db, "anuncios", id),
    {
      "instagram.publicado": true,

      "instagram.status":
        "publicado",

      "instagram.publicadoEm":
        Timestamp.now(),

      "instagram.mediaId":
        resultado.instagramMediaId ||
        null,

      "instagram.containerId":
        resultado.containerId ||
        null,

      "instagram.imagemUrl":
        resultado.imagemUrl ||
        null
    }
  );

  await carregarAnuncios();
}

/* ======================================================
   MARCAÇÃO MANUAL
====================================================== */

async function marcarComoPostado(
  id,
  botao
) {
  const confirmar = window.confirm(
    "Deseja marcar este anúncio como postado manualmente?"
  );

  if (!confirmar) {
    return;
  }

  const textoOriginal =
    botao.textContent;

  botao.disabled = true;
  botao.textContent =
    "Salvando...";

  try {
    await updateDoc(
      doc(db, "anuncios", id),
      {
        "instagram.publicado": true,

        "instagram.status":
          "postado_manual",

        "instagram.publicadoEm":
          Timestamp.now()
      }
    );

    alert(
      "Anúncio marcado como postado!"
    );

    await carregarAnuncios();

  } catch (erro) {
    console.error(
      "Erro ao marcar anúncio como postado:",
      erro
    );

    alert(
      "Não foi possível marcar o anúncio como postado."
    );

  } finally {
    botao.disabled = false;
    botao.textContent =
      textoOriginal;
  }
}

/* ======================================================
   ESCOLHA DO TEMA
====================================================== */

function escolherTema(anuncio) {
  const categoria =
    anuncio.categoria || "Outros";

  return (
    TEMAS[categoria] ||
    TEMAS["Outros"]
  );
}

/* ======================================================
   LIMITAR TAMANHO DO TEXTO
====================================================== */

function limitarTexto(
  texto,
  limite
) {
  const textoSeguro =
    String(texto || "");

  if (
    textoSeguro.length <= limite
  ) {
    return textoSeguro;
  }

  return (
    textoSeguro.substring(
      0,
      limite
    ) + "..."
  );
}

/* ======================================================
   PROTEÇÃO DE TEXTO NO HTML
====================================================== */

function escaparHTML(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ======================================================
   INICIAR PÁGINA
====================================================== */

carregarAnuncios();