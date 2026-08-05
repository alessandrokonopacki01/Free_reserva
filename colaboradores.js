import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const lista = document.getElementById("listaColaboradores");
const quantidade = document.getElementById("quantidadeColaboradores");
const mensagemVazia = document.getElementById("mensagemVazia");

carregarColaboradores();

async function carregarColaboradores() {

    try {

        const q = query(
            collection(db, "colaboradores"),
            where("ativo", "==", true),
            orderBy("nome")
        );

        const snapshot = await getDocs(q);

        lista.innerHTML = "";

        if (snapshot.empty) {

            quantidade.textContent = "0 colaboradores";

            mensagemVazia.classList.remove("oculto");

            return;
        }

        mensagemVazia.classList.add("oculto");

        quantidade.textContent =
            `${snapshot.size} colaborador${snapshot.size > 1 ? "es" : ""}`;

        snapshot.forEach((doc) => {

            const empresa = doc.data();

            const card = document.createElement("div");

            card.className = "card-colaborador";

            card.innerHTML = `

                <div class="logo-colaborador">

                    <img
                        src="${empresa.logoUrl}"
                        alt="${empresa.nome}"
                        loading="lazy"
                        onerror="this.src='https://placehold.co/400x250/111111/FFD700?text=LOGO';"
                    >

                </div>

                <div class="info-colaborador">

                    <span class="selo-colaborador">
                        ⭐ COLABORADOR OFICIAL
                    </span>

                    <h3>${empresa.nome}</h3>

                    <p>
                        ${empresa.descricao || ""}
                    </p>

                    <a
                        class="btn-whats"
                        href="https://wa.me/55${empresa.whatsapp}"
                        target="_blank"
                    >
                        💬 Conversar no WhatsApp
                    </a>

                </div>

            `;

            lista.appendChild(card);

        });

    }

    catch (erro) {

        console.error(erro);

        lista.innerHTML = `
            <div class="mensagem-vazia">

                <h2>
                    Erro ao carregar colaboradores.
                </h2>

            </div>
        `;

    }

}