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
    addDoc,
    setDoc,
    deleteDoc,
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
const totalVisualizacoes = document.getElementById("totalVisualizacoes");

const totalVideos = document.getElementById("totalVideos");
const totalDesbloqueios = document.getElementById("totalDesbloqueios");
const totalCreditosUtilizados = document.getElementById("totalCreditosUtilizados");
const listaEstatisticas = document.getElementById("listaEstatisticas");

let profissionais = [];
let anuncios = [];
let destaques = [];

let videosPatrocinados = [];
let colaboradores = [];

const formColaborador =
    document.getElementById("formColaborador");

const listaColaboradoresAdmin =
    document.getElementById("listaColaboradoresAdmin");

const mensagemColaborador =
    document.getElementById("mensagemColaborador");
    
const formVideoAnuncio =
    document.getElementById("formVideoAnuncio");

const listaVideosAdmin =
    document.getElementById("listaVideosAdmin");

const mensagemVideo =
    document.getElementById("mensagemVideo");

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
const [
    snapshotUsuarios,
    snapshotAnuncios,
    snapshotDestaques,
    snapshotVideos,
    snapshotColaboradores
] = await Promise.all([

    getDocs(collection(db, "usuarios")),

    getDocs(
        query(
            collection(db, "anuncios"),
            orderBy("criadoEm", "desc")
        )
    ),

    getDocs(collection(db, "destaques")),

    getDocs(
        query(
            collection(db, "anunciosVideos"),
            orderBy("criadoEm", "desc")
        )
    ),

    getDocs(
        query(
            collection(db, "colaboradores"),
            orderBy("nome")
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

        destaques = snapshotDestaques.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        videosPatrocinados =
    snapshotVideos.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
    }));

    colaboradores =
    snapshotColaboradores.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
    }));

        atualizarResumo();
        renderizarProfissionais(profissionais);
        renderizarAnuncios(anuncios);
        renderizarUltimosAnuncios();
        renderizarVideosPatrocinados();
        renderizarColaboradores();
await carregarEstatisticas();

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
    const tabela =
        document.getElementById("tabelaProfissionais");

    const vazio =
        document.getElementById("vazioProfissionais");

    if (lista.length === 0) {
        tabela.innerHTML = "";
        vazio.classList.remove("oculto");
        return;
    }

    vazio.classList.add("oculto");

    tabela.innerHTML = lista.map((profissional) => {
        const estaEmDestaque = destaques.some(
            (destaque) => destaque.id === profissional.id
        );

        return `
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

                <td>
                    ${estaEmDestaque
                ? `
                                <button
                                    class="btn-destaque remover"
                                    data-acao-destaque="remover"
                                    data-profissional-id="${profissional.id}"
                                >
                                    Remover destaque
                                </button>
                            `
                : `
                                <button
                                    class="btn-destaque adicionar"
                                    data-acao-destaque="adicionar"
                                    data-profissional-id="${profissional.id}"
                                >
                                    Colocar em destaque
                                </button>
                            `
            }
                </td>
            </tr>
        `;
    }).join("");
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
                obterStatus(anuncio) === statusSelecionado;

            return (
                correspondeTexto &&
                correspondeStatus
            );
        }
    );

    renderizarAnuncios(filtrados);
}

/* ======================================================
   CONTROLE DOS PROFISSIONAIS EM DESTAQUE
====================================================== */

document
    .getElementById("tabelaProfissionais")
    .addEventListener("click", async (evento) => {

        const botao = evento.target.closest(
            "[data-acao-destaque][data-profissional-id]"
        );

        if (!botao) {
            return;
        }

        const profissionalId =
            botao.dataset.profissionalId;

        const acao =
            botao.dataset.acaoDestaque;

        const profissional = profissionais.find(
            (item) => item.id === profissionalId
        );

        if (!profissional) {
            alert("Profissional não encontrado.");
            return;
        }

        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            const referenciaDestaque = doc(
                db,
                "destaques",
                profissionalId
            );

            if (acao === "adicionar") {
                const servico = prompt(
                    `Qual é o serviço de ${profissional.nome || "este profissional"}?`,
                    profissional.categoria ||
                    profissional.profissao ||
                    ""
                );

                if (!servico || !servico.trim()) {
                    alert("Informe o serviço do profissional.");
                    botao.disabled = false;
                    botao.textContent = "Colocar em destaque";
                    return;
                }

                const whatsapp = prompt(
                    "Informe o WhatsApp do profissional com DDD:",
                    profissional.whatsapp ||
                    profissional.telefone ||
                    ""
                );

                const numeroLimpo = String(whatsapp || "")
                    .replace(/\D/g, "");

                if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
                    alert(
                        "Informe um WhatsApp válido com DDD. Exemplo: 42999999999"
                    );

                    botao.disabled = false;
                    botao.textContent = "Colocar em destaque";
                    return;
                }

                const descricao = prompt(
                    "Escreva uma descrição curta sobre o profissional:",
                    profissional.descricao ||
                    `${servico.trim()} em Reserva e região.`
                );

                if (!descricao || !descricao.trim()) {
                    alert("Informe uma descrição para o destaque.");
                    botao.disabled = false;
                    botao.textContent = "Colocar em destaque";
                    return;
                }

                const quantidadeDias = 7;

                const inicioDestaque = new Date();
                const fimDestaque = new Date();

                fimDestaque.setDate(
                    fimDestaque.getDate() + quantidadeDias
                );

                await setDoc(referenciaDestaque, {
                    profissionalId,

                    nome:
                        profissional.nome ||
                        "Profissional",

                    servico: servico.trim(),

                    categoria: servico.trim(),

                    cidade:
                        profissional.cidade ||
                        "Reserva - PR",

                    descricao: descricao.trim(),

                    foto:
                        profissional.foto ||
                        profissional.fotoPerfil ||
                        "",

                    whatsapp: numeroLimpo,

                    ativo: true,

                    duracaoDias: quantidadeDias,

                    inicioDestaque:
                        Timestamp.fromDate(inicioDestaque),

                    fimDestaque:
                        Timestamp.fromDate(fimDestaque),

                    criadoEm: Timestamp.now()
                });

                alert(
                    `${profissional.nome || "Profissional"} ficará em destaque por ${quantidadeDias} dias.`
                );
            }

            if (acao === "remover") {
                await deleteDoc(referenciaDestaque);

                alert(
                    `${profissional.nome || "Profissional"} foi removido dos destaques.`
                );
            }

            await carregarDados();

        } catch (erro) {
            console.error(
                "Erro ao alterar destaque:",
                erro
            );

            alert(
                "Não foi possível alterar o destaque."
            );

            botao.disabled = false;
            botao.textContent =
                acao === "adicionar"
                    ? "Colocar em destaque"
                    : "Remover destaque";
        }
    });

    function extrairIdYoutube(url) {

    try {

        const endereco = new URL(url);

        if (endereco.hostname.includes("youtu.be")) {
            return endereco.pathname.replace("/", "");
        }

        if (endereco.pathname.includes("/shorts/")) {
            return endereco.pathname
                .split("/shorts/")[1]
                .split("/")[0];
        }

        if (endereco.pathname.includes("/embed/")) {
            return endereco.pathname
                .split("/embed/")[1]
                .split("/")[0];
        }

        return endereco.searchParams.get("v");

    } catch (erro) {

        return null;
    }
}

formVideoAnuncio.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();

        const empresa =
            document.getElementById("empresaVideo")
                .value.trim();

        const titulo =
            document.getElementById("tituloVideo")
                .value.trim();

        const youtubeUrl =
            document.getElementById("youtubeUrl")
                .value.trim();

        const youtubeId =
            extrairIdYoutube(youtubeUrl);

        if (!empresa || !titulo) {

            mensagemVideo.textContent =
                "Preencha o nome da empresa e o título.";

            return;
        }

        if (!youtubeId) {

            mensagemVideo.textContent =
                "Informe um link válido do YouTube.";

            return;
        }

        mensagemVideo.textContent =
            "Salvando anúncio...";

        try {

            await addDoc(
                collection(db, "anunciosVideos"),
                {
                    empresa,
                    titulo,
                    youtubeUrl,
                    youtubeId,

                    // O vídeo já entra ativo.
                    ativo: true,

                    visualizacoes: 0,
                    conclusoes: 0,
                    valorMensal: 100,
                    criadoEm: Timestamp.now()
                }
            );

            formVideoAnuncio.reset();

            mensagemVideo.textContent =
                "Anúncio cadastrado com sucesso!";

            await carregarDados();

        } catch (erro) {

            console.error(
                "Erro ao cadastrar anúncio em vídeo:",
                erro
            );

            mensagemVideo.textContent =
                "Erro ao cadastrar anúncio: " + erro.message;
        }
    }
);
function renderizarVideosPatrocinados() {

    if (!listaVideosAdmin) {
        return;
    }

    if (videosPatrocinados.length === 0) {

        listaVideosAdmin.innerHTML =
            "<p>Nenhum anúncio cadastrado.</p>";

        return;
    }

    listaVideosAdmin.innerHTML =
        videosPatrocinados.map((video) => {

            return `
                <article class="card-admin">

                    <h3>
                        ${escaparHTML(
                            video.titulo || "Anúncio"
                        )}
                    </h3>

                    <p>
                        Empresa:
                        ${escaparHTML(
                            video.empresa || ""
                        )}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${video.ativo
                                ? "Ativo"
                                : "Inativo"}
                        </strong>
                    </p>

                    <iframe
                        width="100%"
                        height="220"
                        src="https://www.youtube.com/embed/${video.youtubeId}"
                        title="Prévia do anúncio"
                        frameborder="0"
                        allowfullscreen
                    ></iframe>

                    <div class="acoes-admin">

                        <button
                            data-video-id="${video.id}"
                            data-acao="ativar-video"
                        >
                            Ativar
                        </button>

                        <button
                            data-video-id="${video.id}"
                            data-acao="excluir-video"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `;
        }).join("");
}

listaVideosAdmin.addEventListener(
    "click",
    async (evento) => {

        const botao =
            evento.target.closest("[data-video-id]");

        if (!botao) {
            return;
        }

        const videoId =
            botao.dataset.videoId;

        const acao =
            botao.dataset.acao;

        try {

            if (acao === "ativar-video") {

              window.ativarVideo = async function (videoId) {

    try {

        const videoRef =
            doc(db, "anunciosVideos", videoId);

        await updateDoc(
            videoRef,
            {
                ativo: true
            }
        );

        console.log(
            "Vídeo ativado:",
            videoId
        );

        await carregarDados();

    } catch (erro) {

        console.error(
            "Erro ao ativar vídeo:",
            erro
        );

        alert(
            "Não foi possível ativar o vídeo: " +
            erro.message
        );
    }
};
            }

            window.desativarVideo = async function (videoId) {

    try {

        const videoRef =
            doc(db, "anunciosVideos", videoId);

        await updateDoc(
            videoRef,
            {
                ativo: false
            }
        );

        console.log(
            "Vídeo desativado:",
            videoId
        );

        await carregarDados();

    } catch (erro) {

        console.error(
            "Erro ao desativar vídeo:",
            erro
        );

        alert(
            "Não foi possível desativar o vídeo: " +
            erro.message
        );
    }
};

            if (acao === "excluir-video") {

                const confirmar = confirm(
                    "Deseja excluir este anúncio?"
                );

                if (!confirmar) {
                    return;
                }

                await deleteDoc(
                    doc(
                        db,
                        "anunciosVideos",
                        videoId
                    )
                );
            }

            await carregarDados();

        } catch (erro) {

            console.error(
                "Erro ao alterar anúncio:",
                erro
            );

            alert(
                "Não foi possível alterar o anúncio."
            );
        }
    }
);

async function carregarEstatisticas() {
      console.log("ELEMENTOS:", {
        totalVisualizacoes,
        totalVideos,
        totalDesbloqueios,
        totalCreditosUtilizados,
        listaEstatisticas
    });

    if (
        !totalVisualizacoes ||
        !totalVideos ||
        !totalDesbloqueios ||
        !totalCreditosUtilizados ||
        !listaEstatisticas
    ) {
        console.error(
            "Um ou mais elementos das estatísticas não foram encontrados."
        );

        return;
    }

    try {
        const [
            snapshotVideos,
            snapshotDesbloqueios
        ] = await Promise.all([
            getDocs(
                collection(db, "anunciosVideos")
            ),

            getDocs(
                collection(db, "desbloqueios")
            )
        ]);

        const videos = snapshotVideos.docs.map(
            (documento) => ({
                id: documento.id,
                ...documento.data()
            })
        );

        console.log("VÍDEOS DO FIREBASE:", videos);

        const desbloqueios =
            snapshotDesbloqueios.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...documento.data()
                })
            );

        const desbloqueiosPorAnuncio =
            desbloqueios.filter(
                (item) =>
                    item.formaDesbloqueio === "anuncio"
            );

        const desbloqueiosPorCredito =
            desbloqueios.filter(
                (item) =>
                    item.formaDesbloqueio === "credito"
            );

        const visualizacoesGerais =
            videos.reduce(
                (total, video) =>
                    total +
                    Number(video.visualizacoes || 0),
                0
            );

        const conclusoesGerais =
            videos.reduce(
                (total, video) =>
                    total +
                    Number(video.conclusoes || 0),
                0
            );

            console.log("TOTAL VISUALIZAÇÕES:", visualizacoesGerais);
console.log("TOTAL CONCLUSÕES:", conclusoesGerais);

        totalVisualizacoes.textContent =
            visualizacoesGerais;

        totalVideos.textContent =
            conclusoesGerais;

        totalDesbloqueios.textContent =
            desbloqueiosPorAnuncio.length;

        totalCreditosUtilizados.textContent =
    desbloqueiosPorCredito.length;

        if (videos.length === 0) {
            listaEstatisticas.innerHTML =
                "<p>Nenhum anunciante cadastrado.</p>";

            return;
        }

        listaEstatisticas.innerHTML =
            videos.map((video) => {

                const visualizacoes =
                    Number(
                        video.visualizacoes || 0
                    );

                const conclusoes =
                    Number(
                        video.conclusoes || 0
                    );

                const desbloqueiosDoVideo =
                    desbloqueiosPorAnuncio.filter(
                        (item) =>
                            item.anuncioVideoId ===
                            video.id
                    ).length;

                const taxaConclusao =
                    visualizacoes > 0
                        ? (
                            conclusoes /
                            visualizacoes *
                            100
                        ).toFixed(1)
                        : "0.0";

                const valorCampanha =
                    Number(video.valorMensal || 100);

                const custoVisualizacao =
                    visualizacoes > 0
                        ? (
                            valorCampanha /
                            visualizacoes
                        ).toFixed(2)
                        : "0.00";

                return `
                    <article class="card-estatistica">

                        <h3>
                            🏪 ${escaparHTML(
                                video.empresa ||
                                "Empresa anunciante"
                            )}
                        </h3>

                        <p>
                            📢 ${escaparHTML(
                                video.titulo ||
                                "Anúncio patrocinado"
                            )}
                        </p>

                        <p>
                            👁 Visualizações:
                            <strong>
                                ${visualizacoes}
                            </strong>
                        </p>

                        <p>
                            🎬 Vídeos completos:
                            <strong>
                                ${conclusoes}
                            </strong>
                        </p>

                        <p>
                            📈 Taxa de conclusão:
                            <strong>
                                ${taxaConclusao}%
                            </strong>
                        </p>

                        <p>
                            🔓 Contatos desbloqueados:
                            <strong>
                                ${desbloqueiosDoVideo}
                            </strong>
                        </p>

                        <p>
                            💵 Custo por visualização:
                            <strong>
                                R$ ${custoVisualizacao}
                            </strong>
                        </p>

                        <p>
                            ${video.ativo ? "🟢" : "🔴"}
                            Status:
                            <strong>
                                ${video.ativo
                                    ? "Ativo"
                                    : "Inativo"}
                            </strong>
                        </p>

                    </article>
                `;
            }).join("");

    } catch (erro) {
        console.error(
            "Erro ao carregar estatísticas:",
            erro
        );

        listaEstatisticas.innerHTML =
            "<p>Não foi possível carregar as estatísticas.</p>";
    }
}

/* ======================================================
   COLABORADORES
====================================================== */

if (formColaborador) {

    formColaborador.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            const nome = document
                .getElementById("nomeColaborador")
                .value
                .trim();

            const logoUrl = document
                .getElementById("logoColaborador")
                .value
                .trim();

            const whatsapp = document
                .getElementById("whatsappColaborador")
                .value
                .replace(/\D/g, "");

            const endereco = document
                .getElementById("enderecoColaborador")
                .value
                .trim();

            const instagram = document
                .getElementById("instagramColaborador")
                .value
                .trim()
                .replace(/^@/, "");

            if (
                whatsapp.length < 10 ||
                whatsapp.length > 11
            ) {
                mensagemColaborador.textContent =
                    "Informe um WhatsApp válido com DDD.";

                return;
            }

            mensagemColaborador.textContent =
                "Salvando colaborador...";

            try {

                await addDoc(
                    collection(db, "colaboradores"),
                    {
                        nome,
                        logoUrl,
                        whatsapp,
                        endereco,
                        instagram,
                        ativo: true,
                        criadoEm: Timestamp.now()
                    }
                );

                formColaborador.reset();

                mensagemColaborador.textContent =
                    "Colaborador cadastrado com sucesso!";

                await carregarDados();

            } catch (erro) {

                console.error(
                    "Erro ao cadastrar colaborador:",
                    erro
                );

                mensagemColaborador.textContent =
                    "Não foi possível cadastrar o colaborador.";
            }
        }
    );
}

function renderizarColaboradores() {

    if (!listaColaboradoresAdmin) {
        return;
    }

    if (colaboradores.length === 0) {

        listaColaboradoresAdmin.innerHTML =
            '<p class="estado-vazio">Nenhum colaborador cadastrado.</p>';

        return;
    }

    listaColaboradoresAdmin.innerHTML =
        colaboradores
            .map((colaborador) => {

                const instagramUsuario =
                    String(colaborador.instagram || "")
                        .replace(/^@/, "");

                const instagramUrl =
                    instagramUsuario
                        ? `https://www.instagram.com/${encodeURIComponent(
                            instagramUsuario
                        )}/`
                        : "";

                const numeroWhatsapp =
                    String(colaborador.whatsapp || "")
                        .replace(/\D/g, "");

                return `
                    <article class="card-admin card-colaborador-admin">

                        <div class="logo-colaborador-admin">

                            <img
                                src="${escaparHTML(
                                    colaborador.logoUrl || ""
                                )}"
                                alt="Logo de ${escaparHTML(
                                    colaborador.nome ||
                                    "colaborador"
                                )}"
                                loading="lazy"
                            >

                        </div>

                        <h3>
                            ${escaparHTML(
                                colaborador.nome ||
                                "Empresa"
                            )}
                        </h3>

                        <p>
                            📍
                            ${escaparHTML(
                                colaborador.endereco ||
                                "Endereço não informado"
                            )}
                        </p>

                        <p>
                            📱
                            <a
                                href="https://wa.me/55${numeroWhatsapp}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escaparHTML(numeroWhatsapp)}
                            </a>
                        </p>

                        <p>
                            📸
                            ${
                                instagramUrl
                                    ? `
                                        <a
                                            href="${instagramUrl}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            @${escaparHTML(
                                                instagramUsuario
                                            )}
                                        </a>
                                    `
                                    : "Instagram não informado"
                            }
                        </p>

                        <p>
                            Status:
                            <strong class="status ${
                                colaborador.ativo
                                    ? "ativo"
                                    : "expirado"
                            }">
                                ${
                                    colaborador.ativo
                                        ? "Ativo"
                                        : "Inativo"
                                }
                            </strong>
                        </p>

                        <div class="acoes-admin">

                            <button
                                type="button"
                                data-colaborador-id="${colaborador.id}"
                                data-acao-colaborador="alternar"
                            >
                                ${
                                    colaborador.ativo
                                        ? "Desativar"
                                        : "Ativar"
                                }
                            </button>

                            <button
                                type="button"
                                data-colaborador-id="${colaborador.id}"
                                data-acao-colaborador="excluir"
                            >
                                Excluir
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");
}

if (listaColaboradoresAdmin) {

    listaColaboradoresAdmin.addEventListener(
        "click",
        async (evento) => {

            const botao = evento.target.closest(
                "[data-colaborador-id]"
            );

            if (!botao) {
                return;
            }

            const colaboradorId =
                botao.dataset.colaboradorId;

            const acao =
                botao.dataset.acaoColaborador;

            const colaborador =
                colaboradores.find(
                    (item) =>
                        item.id === colaboradorId
                );

            if (!colaborador) {
                alert("Colaborador não encontrado.");
                return;
            }

            botao.disabled = true;

            try {

                const referencia = doc(
                    db,
                    "colaboradores",
                    colaboradorId
                );

                if (acao === "alternar") {

                    await updateDoc(
                        referencia,
                        {
                            ativo:
                                !colaborador.ativo
                        }
                    );
                }

                if (acao === "excluir") {

                    const confirmar = confirm(
                        `Deseja excluir ${colaborador.nome}?`
                    );

                    if (!confirmar) {
                        botao.disabled = false;
                        return;
                    }

                    await deleteDoc(referencia);
                }

                await carregarDados();

            } catch (erro) {

                console.error(
                    "Erro ao alterar colaborador:",
                    erro
                );

                alert(
                    "Não foi possível alterar o colaborador."
                );

                botao.disabled = false;
            }
        }
    );
}