import { auth, db } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ADMIN_EMAIL = "alessandrokonopacki@gmail.com";
const provider = new GoogleAuthProvider();

const telaAcesso = document.getElementById("telaAcesso");
const painelAdmin = document.getElementById("painelAdmin");
const mensagemAcesso = document.getElementById("mensagemAcesso");
const btnEntrarAdmin = document.getElementById("btnEntrarAdmin");
const btnSair = document.getElementById("btnSair");
const btnAtualizar = document.getElementById("btnAtualizar");

let profissionais = [];
let anuncios = [];

/* ======================================================
   LOGIN DO ADMINISTRADOR
====================================================== */

btnEntrarAdmin.addEventListener("click", async () => {
    mensagemAcesso.textContent = "";
    btnEntrarAdmin.disabled = true;
    btnEntrarAdmin.textContent = "Entrando...";

    try {
        const resultado = await signInWithPopup(auth, provider);

        if (resultado.user.email !== ADMIN_EMAIL) {
            await signOut(auth);

            mensagemAcesso.textContent =
                "Esta conta não possui acesso ao painel.";
        }
    } catch (erro) {
        console.error("Erro no login administrativo:", erro);

        mensagemAcesso.textContent =
            "Não foi possível entrar. Tente novamente.";
    } finally {
        btnEntrarAdmin.disabled = false;
        btnEntrarAdmin.textContent = "Entrar com Google";
    }
});

btnSair.addEventListener("click", async () => {
    await signOut(auth);
});

btnAtualizar.addEventListener("click", carregarDados);

/* ======================================================
   VERIFICAÇÃO DO USUÁRIO CONECTADO
====================================================== */

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        exibirTelaAcesso();
        return;
    }

    if (usuario.email !== ADMIN_EMAIL) {
        await signOut(auth);

        mensagemAcesso.textContent =
            "Esta conta não possui acesso ao painel.";

        return;
    }

    document.getElementById("nomeAdmin").textContent =
        usuario.displayName || "Administrador";

    document.getElementById("emailAdmin").textContent =
        usuario.email;

    telaAcesso.classList.add("oculto");
    painelAdmin.classList.remove("oculto");

    await carregarDados();
});

function exibirTelaAcesso() {
    painelAdmin.classList.add("oculto");
    telaAcesso.classList.remove("oculto");
}

/* ======================================================
   CARREGAMENTO DOS DADOS
====================================================== */

async function carregarDados() {
    btnAtualizar.disabled = true;
    btnAtualizar.textContent = "Atualizando...";

    try {
        const [snapshotUsuarios, snapshotAnuncios] =
            await Promise.all([
                getDocs(collection(db, "usuarios")),

                getDocs(
                    query(
                        collection(db, "anuncios"),
                        orderBy("criadoEm", "desc")
                    )
                )
            ]);

        profissionais = snapshotUsuarios.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        anuncios = snapshotAnuncios.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        atualizarResumo();
        renderizarProfissionais(profissionais);
        renderizarAnuncios(anuncios);
        renderizarUltimosAnuncios();
    } catch (erro) {
        console.error("Erro ao carregar o painel:", erro);

        alert(
            "Não foi possível carregar os dados. Verifique as regras do Firestore."
        );
    } finally {
        btnAtualizar.disabled = false;
        btnAtualizar.textContent = "Atualizar dados";
    }
}

/* ======================================================
   RESUMO DO PAINEL
====================================================== */

function atualizarResumo() {
    const ativos = anuncios.filter(
        (anuncio) => obterStatus(anuncio) === "ativo"
    ).length;

    const creditos = profissionais.reduce(
        (total, profissional) => {
            return total + Number(profissional.creditos || 0);
        },
        0
    );

    document.getElementById("totalProfissionais").textContent =
        profissionais.length;

    document.getElementById("totalAnuncios").textContent =
        anuncios.length;

    document.getElementById("totalAtivos").textContent =
        ativos;

    document.getElementById("totalCreditos").textContent =
        creditos;
}

/* ======================================================
   ÚLTIMOS ANÚNCIOS
====================================================== */

function renderizarUltimosAnuncios() {
    const container = document.getElementById("ultimosAnuncios");
    const ultimos = anuncios.slice(0, 5);

    if (ultimos.length === 0) {
        container.innerHTML =
            '<p class="estado-vazio">Nenhum anúncio cadastrado.</p>';

        return;
    }

    container.innerHTML = ultimos
        .map((anuncio) => {
            const status = obterStatus(anuncio);

            return `
                <div class="item-compacto">
                    <div>
                        <strong>
                            ${escaparHTML(anuncio.titulo || "Sem título")}
                        </strong>

                        <p>
                            ${escaparHTML(anuncio.nome || "Cliente não informado")}
                            ·
                            ${escaparHTML(anuncio.categoria || "Sem categoria")}
                        </p>
                    </div>

                    <span class="status ${status}">
                        ${status === "ativo" ? "Ativo" : "Expirado"}
                    </span>
                </div>
            `;
        })
        .join("");
}

/* ======================================================
   LISTA DE PROFISSIONAIS
====================================================== */

function renderizarProfissionais(lista) {
    const tabela = document.getElementById("tabelaProfissionais");
    const vazio = document.getElementById("vazioProfissionais");

    if (lista.length === 0) {
        tabela.innerHTML = "";
        vazio.classList.remove("oculto");
        return;
    }

    vazio.classList.add("oculto");

    tabela.innerHTML = lista
        .map(
            (profissional) => `
                <tr>
                    <td>
                        ${escaparHTML(
                            profissional.nome || "Não informado"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            profissional.email || "Não informado"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            profissional.tipo || "profissional"
                        )}
                    </td>

                    <td>
                        ${Number(profissional.creditos || 0)}
                    </td>

                    <td>
                        ${formatarData(profissional.criadoEm)}
                    </td>
                </tr>
            `
        )
        .join("");
}

/* ======================================================
   LISTA DE ANÚNCIOS
====================================================== */

function renderizarAnuncios(lista) {
    const container =
        document.getElementById("listaAnunciosAdmin");

    const vazio =
        document.getElementById("vazioAnuncios");

    if (lista.length === 0) {
        container.innerHTML = "";
        vazio.classList.remove("oculto");
        return;
    }

    vazio.classList.add("oculto");

    container.innerHTML = lista
        .map((anuncio) => {
            const status = obterStatus(anuncio);

            return `
                <article class="anuncio-admin">

                    <h3>
                        ${escaparHTML(anuncio.titulo || "Sem título")}
                    </h3>

                    <p>
                        <strong>Cliente:</strong>
                        ${escaparHTML(
                            anuncio.nome || "Não informado"
                        )}
                    </p>

                    <p>
                        <strong>Categoria:</strong>
                        ${escaparHTML(
                            anuncio.categoria || "Não informada"
                        )}
                    </p>

                    <p>
                        ${escaparHTML(
                            anuncio.descricao || "Sem descrição"
                        )}
                    </p>

                    <div class="anuncio-rodape">
                        <span>
                            ${formatarData(anuncio.criadoEm)}
                        </span>

                        <span class="status ${status}">
                            ${status === "ativo"
                                ? "Ativo"
                                : "Expirado"}
                        </span>
                    </div>

                    <div class="acoes-anuncio">

                        <button
                            class="btn-status btn-ativar"
                            data-acao="ativar"
                            data-id="${anuncio.id}"
                            ${status === "ativo" ? "disabled" : ""}
                        >
                            Ativar por 24 horas
                        </button>

                        <button
                            class="btn-status btn-expirar"
                            data-acao="expirar"
                            data-id="${anuncio.id}"
                            ${status === "expirado" ? "disabled" : ""}
                        >
                            Marcar como expirado
                        </button>

                    </div>

                </article>
            `;
        })
        .join("");
}

/* ======================================================
   ALTERAÇÃO DO STATUS DO ANÚNCIO
====================================================== */

document
    .getElementById("listaAnunciosAdmin")
    .addEventListener("click", async (evento) => {
        const botao = evento.target.closest(
            "[data-acao][data-id]"
        );

        if (!botao) {
            return;
        }

        const anuncioId = botao.dataset.id;
        const acao = botao.dataset.acao;

        if (acao === "ativar") {
            await alterarStatusAnuncio(
                anuncioId,
                "ativo",
                botao
            );
        }

        if (acao === "expirar") {
            await alterarStatusAnuncio(
                anuncioId,
                "expirado",
                botao
            );
        }
    });

async function alterarStatusAnuncio(
    anuncioId,
    novoStatus,
    botao
) {
    const textoOriginal = botao.textContent;

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const referencia = doc(
            db,
            "anuncios",
            anuncioId
        );

       if (novoStatus === "ativo") {
    const novaExpiracao = new Date();

    novaExpiracao.setHours(
        novaExpiracao.getHours() + 24
    );

    await updateDoc(referencia, {
        status: "ativo",

        expiraEm: Timestamp.fromDate(
            novaExpiracao
        ),

        // Faz o anúncio aparecer novamente
        // na página stories.html
        "instagram.publicado": false,
        "instagram.status": "pendente"
    });
}

        if (novoStatus === "expirado") {
            await updateDoc(referencia, {
                status: "expirado",

                // Data no passado para o site reconhecer
                // imediatamente como expirado.
                expiraEm: Timestamp.fromDate(
                    new Date(0)
                )
            });
        }

        await carregarDados();
    } catch (erro) {
        console.error(
            "Erro ao alterar o estado do anúncio:",
            erro
        );

        alert(
            "Não foi possível alterar o estado do anúncio."
        );

        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

/* ======================================================
   VERIFICAÇÃO DO STATUS
====================================================== */

function obterStatus(anuncio) {
    if (
        anuncio.expiraEm &&
        typeof anuncio.expiraEm.toDate === "function"
    ) {
        const dataExpiracao =
            anuncio.expiraEm.toDate().getTime();

        return dataExpiracao > Date.now()
            ? "ativo"
            : "expirado";
    }

    return anuncio.status === "ativo"
        ? "ativo"
        : "expirado";
}

/* ======================================================
   FORMATAÇÃO
====================================================== */

function formatarData(timestamp) {
    if (
        !timestamp ||
        typeof timestamp.toDate !== "function"
    ) {
        return "Não informada";
    }

    return timestamp
        .toDate()
        .toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
}

function escaparHTML(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ======================================================
   NAVEGAÇÃO ENTRE AS SEÇÕES
====================================================== */

document
    .querySelectorAll(".menu-item")
    .forEach((botao) => {
        botao.addEventListener("click", () => {
            const idSecao = botao.dataset.secao;

            document
                .querySelectorAll(".menu-item")
                .forEach((item) => {
                    item.classList.remove("ativo");
                });

            document
                .querySelectorAll(".secao")
                .forEach((secao) => {
                    secao.classList.remove("ativa");
                });

            botao.classList.add("ativo");

            document
                .getElementById(idSecao)
                .classList.add("ativa");

            document.getElementById(
                "tituloSecao"
            ).textContent = botao.textContent;
        });
    });

/* ======================================================
   BUSCA DE PROFISSIONAIS
====================================================== */

document
    .getElementById("buscaProfissional")
    .addEventListener("input", (evento) => {
        const termo = evento.target.value
            .trim()
            .toLowerCase();

        const filtrados = profissionais.filter(
            (profissional) => {
                const nome = String(
                    profissional.nome || ""
                ).toLowerCase();

                const email = String(
                    profissional.email || ""
                ).toLowerCase();

                return (
                    nome.includes(termo) ||
                    email.includes(termo)
                );
            }
        );

        renderizarProfissionais(filtrados);
    });

/* ======================================================
   BUSCA E FILTRO DE ANÚNCIOS
====================================================== */

document
    .getElementById("buscaAnuncio")
    .addEventListener("input", filtrarAnuncios);

document
    .getElementById("filtroStatus")
    .addEventListener("change", filtrarAnuncios);

function filtrarAnuncios() {
    const termo = document
        .getElementById("buscaAnuncio")
        .value
        .trim()
        .toLowerCase();

    const statusSelecionado = document
        .getElementById("filtroStatus")
        .value;

    const filtrados = anuncios.filter(
        (anuncio) => {
            const texto = [
                anuncio.titulo,
                anuncio.nome,
                anuncio.categoria,
                anuncio.descricao
            ]
                .map((item) =>
                    String(item || "").toLowerCase()
                )
                .join(" ");

            const correspondeTexto =
                texto.includes(termo);

            const correspondeStatus =
                statusSelecionado === "todos" ||
                obterStatus(anuncio) ===
                    statusSelecionado;

            return (
                correspondeTexto &&
                correspondeStatus
            );
        }
    );

    renderizarAnuncios(filtrados);
}