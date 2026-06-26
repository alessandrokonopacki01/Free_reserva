import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { imagemBase64 } = req.body;

    const IG_ID = process.env.IG_ID;
    const TOKEN = process.env.META_TOKEN;

    const buffer = Buffer.from(
      imagemBase64.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    const arquivo = await put(`stories/story-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png"
    });

    const criarContainer = await fetch(
      `https://graph.facebook.com/v25.0/${IG_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: arquivo.url,
          media_type: "STORIES",
          access_token: TOKEN
        })
      }
    );

    const container = await criarContainer.json();

    if (!container.id) {
      return res.status(400).json(container);
    }

    const publicar = await fetch(
      `https://graph.facebook.com/v25.0/${IG_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: TOKEN
        })
      }
    );

    const resultado = await publicar.json();

    return res.status(200).json({
      publicado: true,
      imagemUrl: arquivo.url,
      instagram: resultado
    });

  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
}