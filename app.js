import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    Timestamp
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const lista =
    document.getElementById("anuncios");
async function carregar() {
    lista.innerHTML = "";
    const q =
        query(
            collection(db, "anuncios"),
            where(
                "expiraEm",
                ">",
                Timestamp.now()
            ),
            orderBy("expiraEm"),
            orderBy("criadoEm", "desc")
        );
    const snapshot =
        await getDocs(q);
    snapshot.forEach((doc) => {
        const anuncio = doc.data();
        const agora = Date.now();
        const expiraEm = anuncio.expiraEm.toDate().getTime();
        const diferenca = expiraEm - agora;
        const horas = Math.floor(
            diferenca / (1000 * 60 * 60)
        );
        const minutos = Math.floor(
            (diferenca % (1000 * 60 * 60))
            / (1000 * 60)
        );
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
<p>
⏳ Expira em ${horas}h ${minutos}min
</p>
<button onclick="mostrarContato(
'${anuncio.nome}',
'${anuncio.telefone}'
)">
Desbloquear Contato
</button>
</div>
`;

    });
}
window.mostrarContato = function (nome, telefone) {

    document.getElementById("nomeCliente")
        .innerHTML = "<b>Nome:</b> " + nome;
    document.getElementById("telefoneCliente")
        .innerHTML = "<b>Telefone:</b> " + telefone;
    document.getElementById("btnWhatsapp")
        .href = "https://wa.me/55" + telefone;
    document.getElementById("modal")
        .style.display = "block";
}
window.fecharModal = function () {

    document.getElementById("modal")
        .style.display = "none";
}
carregar();