import { db } from "./firebase.js";
import { auth } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    Timestamp,
    doc,
    getDoc,
    updateDoc,
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
const lista =
    document.getElementById("anuncios");
    let usuarioLogado = null;
onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
});
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
⏳ Anúncio expira em ${horas}h ${minutos}min
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
window.mostrarContato = async function (nome, telefone) {

    if (!usuarioLogado) {

        alert("Faça login para desbloquear contatos.");

        return;

    }

    const usuarioRef =
        doc(db, "usuarios", usuarioLogado.uid);

    const usuarioDoc =
        await getDoc(usuarioRef);

    const dados =
        usuarioDoc.data();

    alert(
        "Você possui " +
        dados.creditos +
        " créditos."
    );

}
window.fecharModal = function () {

    document.getElementById("modal")
        .style.display = "none";
}
carregar();