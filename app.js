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
    addDoc,
    setDoc,
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
const lista =
    document.getElementById("anuncios");
const secaoDestaques =
    document.getElementById("secaoDestaques");

const carrosselDestaques =
    document.getElementById("carrosselDestaques");

const indicadoresCarrossel =
    document.getElementById("indicadoresCarrossel");

const botaoAnterior =
    document.getElementById("carrosselAnterior");

const botaoProximo =
    document.getElementById("carrosselProximo");

let profissionaisDestaque = [];
let destaqueAtual = 0;
let intervaloCarrossel = null;
let usuarioLogado = null;
onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
});
/* ======================================================
   CARROSSEL DE PROFISSIONAIS EM DESTAQUE
====================================================== */

async function carregarDestaques() {
    try {
        const snapshot = await getDocs(
            collection(db, "destaques")
        );

        profissionaisDestaque =
            snapshot.docs.map((documento) => ({
                id: documento.id,
                ...documento.data()
            }));

        if (profissionaisDestaque.length === 0) {
            secaoDestaques.classList.add("oculto");
            return;
        }

        secaoDestaques.classList.remove("oculto");

        destaqueAtual = 0;

        renderizarCarrossel();
        iniciarCarrosselAutomatico();

    } catch (erro) {
        console.error(
            "Erro ao carregar profissionais em destaque:",
            erro
        );

        secaoDestaques.classList.add("oculto");
    }
}

function renderizarCarrossel() {
    carrosselDestaques.innerHTML =
        profissionaisDestaque.map(
            (profissional, indice) => {

                const inicial = String(
                    profissional.nome || "P"
                )
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                const foto = profissional.foto
                    ? `
                        <img
                            src="${escaparAtributo(profissional.foto)}"
                            alt="Foto de ${escaparHTMLCarrossel(
                        profissional.nome || "profissional"
                    )}"
                        >
                    `
                    : `
                        <div class="avatar-inicial">
                            ${inicial}
                        </div>
                    `;

                const linkWhatsapp = profissional.whatsapp
                    ? `
                        <a
                            class="btn-contatar-destaque"
                            href="https://wa.me/55${somenteNumeros(
                        profissional.whatsapp
                    )}?text=${encodeURIComponent(
                        "Olá! Vi seu perfil em destaque no site Contrata Reserva."
                    )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Conversar no WhatsApp
                        </a>
                    `
                    : `
                        <span class="perfil-sem-contato">
                            Disponível no Contrata Reserva
                        </span>
                    `;

                return `
                    <article
                        class="card-destaque ${indice === destaqueAtual
                        ? "ativo"
                        : ""
                    }"
                    >
                        <div class="selo-destaque">
                            ★ Destaque
                        </div>

                        <div class="foto-destaque">
                            ${foto}
                        </div>

                        <div class="conteudo-destaque">
                            <span class="categoria-destaque">
                                ${escaparHTMLCarrossel(
                        profissional.categoria ||
                        "Profissional"
                    )}
                            </span>

                            <h3>
                                ${escaparHTMLCarrossel(
                        profissional.nome ||
                        "Profissional"
                    )}
                            </h3>

                            <p class="cidade-destaque">
                                📍 ${escaparHTMLCarrossel(
                        profissional.cidade ||
                        "Reserva - PR"
                    )}
                            </p>

                            <p class="descricao-destaque">
                                ${escaparHTMLCarrossel(
                        profissional.descricao ||
                        "Profissional disponível no Contrata Reserva."
                    )}
                            </p>

                            ${linkWhatsapp}
                        </div>
                    </article>
                `;
            }
        ).join("");

    renderizarIndicadores();
}

function renderizarIndicadores() {
    indicadoresCarrossel.innerHTML =
        profissionaisDestaque.map(
            (_, indice) => `
                <button
                    class="indicador ${indice === destaqueAtual
                    ? "ativo"
                    : ""
                }"
                    data-indice="${indice}"
                    aria-label="Abrir destaque ${indice + 1}"
                ></button>
            `
        ).join("");
}

function mostrarDestaque(indice) {
    if (profissionaisDestaque.length === 0) {
        return;
    }

    if (indice < 0) {
        destaqueAtual =
            profissionaisDestaque.length - 1;
    } else if (
        indice >= profissionaisDestaque.length
    ) {
        destaqueAtual = 0;
    } else {
        destaqueAtual = indice;
    }

    renderizarCarrossel();
}

function iniciarCarrosselAutomatico() {
    pararCarrosselAutomatico();

    if (profissionaisDestaque.length <= 1) {
        return;
    }

    intervaloCarrossel = setInterval(() => {
        mostrarDestaque(destaqueAtual + 1);
    }, 5000);
}

function pararCarrosselAutomatico() {
    if (intervaloCarrossel) {
        clearInterval(intervaloCarrossel);
        intervaloCarrossel = null;
    }
}

botaoAnterior.addEventListener("click", () => {
    mostrarDestaque(destaqueAtual - 1);
    iniciarCarrosselAutomatico();
});

botaoProximo.addEventListener("click", () => {
    mostrarDestaque(destaqueAtual + 1);
    iniciarCarrosselAutomatico();
});

indicadoresCarrossel.addEventListener(
    "click",
    (evento) => {
        const indicador =
            evento.target.closest("[data-indice]");

        if (!indicador) {
            return;
        }

        mostrarDestaque(
            Number(indicador.dataset.indice)
        );

        iniciarCarrosselAutomatico();
    }
);

function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function escaparHTMLCarrossel(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
    return escaparHTMLCarrossel(valor);
}
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
<button onclick="mostrarContato('${doc.id}', '${anuncio.nome}', '${anuncio.telefone}')">
            Desbloquear Contato
        </button>
</div>
`;

    });
}
window.mostrarContato = async function (
    anuncioId,
    nome,
    telefone
) {

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

    const desbloqueioId =
        usuarioLogado.uid + "_" + anuncioId;

    const desbloqueioRef =
        doc(
            db,
            "desbloqueios",
            desbloqueioId
        );

    const desbloqueioDoc =
        await getDoc(desbloqueioRef);

    // Já desbloqueou anteriormente

    if (!desbloqueioDoc.exists()) {

        if (dados.creditos <= 0) {

            alert(
                "Você não possui créditos suficientes."
            );

            return;

        }

        await updateDoc(usuarioRef, {

            creditos:
                dados.creditos - 1

        });

        await setDoc(
            desbloqueioRef,
            {
                usuarioId:
                    usuarioLogado.uid,

                anuncioId:
                    anuncioId,

                data:
                    Timestamp.now()
            }
        );

        console.log(
            "Crédito descontado."
        );

    } else {

        console.log(
            "Anúncio já desbloqueado."
        );

    }

    document.getElementById("nomeCliente")
        .innerHTML =
        "<b>Nome:</b> " + nome;

    document.getElementById("telefoneCliente")
        .innerHTML =
        "<b>Telefone:</b> " + telefone;

    const mensagem =
        `Olá! Vi seu anúncio de serviço no site Contrata Reserva e estou interessado. Podemos combinar o preço?`;

    document.getElementById("btnWhatsapp")
        .href =
        `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;

    document.getElementById("modal")
        .style.display =
        "block";

}
window.fecharModal = function () {

    document.getElementById("modal")
        .style.display = "none";

}
carregarDestaques();
carregar();