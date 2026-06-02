import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const lista =
    document.getElementById("anuncios");
async function carregar() {
    lista.innerHTML = "";
    const q =
        query(
            collection(db, "anuncios"),
            orderBy("criadoEm", "desc")
        );
    const snapshot =
        await getDocs(q);
    snapshot.forEach((doc) => {
        const anuncio = doc.data();
        lista.innerHTML += `
<div class="card">
<h3>${anuncio.titulo}</h3>
<p>
<b>Categoria:</b>
${anuncio.categoria}
</p>
<p>
${anuncio.descricao}
</p>
<p>
📍 ${anuncio.cidade}
</p>
<button>
Desbloquear Contato
</button>
</div>
`;

    });
}
carregar();