import { put } from "@vercel/blob";

const GRAPH_VERSION = "v25.0";
const TEMPO_MAXIMO_ESPERA = 60_000;
const INTERVALO_CONSULTA = 3_000;

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lerRespostaMeta(resposta) {
  const texto = await resposta.text();

  try {
    return JSON.parse(texto);
  } catch {
    return {
      erro: "A Meta retornou uma resposta inválida.",
      respostaOriginal: texto
    };
  }
}

async function consultarStatusContainer(containerId, token) {
  const inicio = Date.now();

  while (Date.now() - inicio < TEMPO_MAXIMO_ESPERA) {
    const resposta = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${containerId}` +
      `?fields=status_code,status&access_token=${encodeURIComponent(token)}`
    );

    const resultado = await lerRespostaMeta(resposta);

    if (!resposta.ok || resultado.error) {
      throw new Error(
        resultado.error?.message ||
        resultado.erro ||
        "Erro ao consultar o contêiner do Instagram."
      );
    }

    console.log("Status do contêiner:", resultado);

    if (resultado.status_code === "FINISHED") {
      return resultado;
    }

    if (
      resultado.status_code === "ERROR" ||
      resultado.status_code === "EXPIRED"
    ) {
      throw new Error(
        `O contêiner do Instagram terminou com status ${resultado.status_code}.` +
        (resultado.status ? ` Detalhes: ${resultado.status}` : "")
      );
    }

    await esperar(INTERVALO_CONSULTA);
  }

  throw new Error(
    "O Instagram demorou mais de 60 segundos para processar a imagem."
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      publicado: false,
      erro: "Método não permitido"
    });
  }

  try {
    const { imagemBase64 } = req.body || {};

    const IG_ID = process.env.IG_ID;
    const TOKEN = process.env.META_TOKEN;

    if (!IG_ID || !TOKEN) {
      return res.status(500).json({
        publicado: false,
        erro:
          "As variáveis IG_ID ou META_TOKEN não estão configuradas na Vercel."
      });
    }

    if (
      typeof imagemBase64 !== "string" ||
      !imagemBase64.startsWith("data:image/")
    ) {
      return res.status(400).json({
        publicado: false,
        erro: "A imagem enviada é inválida."
      });
    }

    const base64Limpo = imagemBase64.replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    );

    const buffer = Buffer.from(base64Limpo, "base64");

    if (!buffer.length) {
      return res.status(400).json({
        publicado: false,
        erro: "Não foi possível converter a imagem."
      });
    }

    const arquivo = await put(
      `stories/story-${Date.now()}.png`,
      buffer,
      {
        access: "public",
        contentType: "image/png",
        addRandomSuffix: true
      }
    );

    console.log("Imagem salva no Blob:", arquivo.url);

    const respostaContainer = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${IG_ID}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image_url: arquivo.url,
          media_type: "STORIES",
          access_token: TOKEN
        })
      }
    );

    const container = await lerRespostaMeta(respostaContainer);

    console.log("Resposta da criação do contêiner:", container);

    if (
      !respostaContainer.ok ||
      container.error ||
      !container.id
    ) {
      return res.status(400).json({
        publicado: false,
        etapa: "criar_container",
        imagemUrl: arquivo.url,
        meta: container,
        erro:
          container.error?.message ||
          "A Meta não criou o contêiner do story."
      });
    }

    await consultarStatusContainer(
      container.id,
      TOKEN
    );

    const respostaPublicacao = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${IG_ID}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: TOKEN
        })
      }
    );

    const resultadoPublicacao =
      await lerRespostaMeta(respostaPublicacao);

    console.log(
      "Resposta da publicação:",
      resultadoPublicacao
    );

    if (
      !respostaPublicacao.ok ||
      resultadoPublicacao.error ||
      !resultadoPublicacao.id
    ) {
      return res.status(400).json({
        publicado: false,
        etapa: "publicar",
        containerId: container.id,
        imagemUrl: arquivo.url,
        meta: resultadoPublicacao,
        erro:
          resultadoPublicacao.error?.message ||
          "O Instagram não confirmou a publicação."
      });
    }

    return res.status(200).json({
      publicado: true,
      imagemUrl: arquivo.url,
      containerId: container.id,
      instagramMediaId: resultadoPublicacao.id
    });

  } catch (erro) {
    console.error("Erro ao publicar story:", erro);

    return res.status(500).json({
      publicado: false,
      erro: erro.message
    });
  }
}