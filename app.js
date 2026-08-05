import { db, auth } from "./firebase.js";

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
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ======================================================
   ELEMENTOS E VARIÁVEIS GLOBAIS
====================================================== */

const lista = document.getElementById("anuncios");

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

let playerAnuncio = null;
let anuncioAtual = null;

/* ======================================================
   AUTENTICAÇÃO
====================================================== */

onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
});

/* ======================================================
   FUNÇÕES AUXILIARES
====================================================== */

function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
    return escaparHTML(valor);
}

function escaparTextoInline(valor) {
    return String(valor ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", " ")
        .replaceAll("\r", " ");
}

/* ======================================================
   CARREGAR PROFISSIONAIS EM DESTAQUE
====================================================== */

async function carregarDestaques() {
    if (
        !secaoDestaques ||
        !carrosselDestaques ||
        !indicadoresCarrossel
    ) {
        return;
    }

    try {
        const snapshot = await getDocs(
            collection(db, "destaques")
        );

        const agora = Date.now();

        const destaquesCadastrados = snapshot.docs
            .map((documento) => ({
                id: documento.id,
                ...documento.data()
            }))
            .filter((profissional) => {
                if (profissional.ativo === false) {
                    return false;
                }

                if (
                    profissional.fimDestaque &&
                    typeof profissional.fimDestaque.toDate ===
                        "function"
                ) {
                    return (
                        profissional.fimDestaque
                            .toDate()
                            .getTime() > agora
                    );
                }

                return true;
            });

        const propagandaDestaque = {
            id: "propaganda-destaque",
            tipo: "propaganda",
            nome: "Seu serviço em destaque",
            servico: "Divulgue seu trabalho",
            categoria: "Espaço disponível",
            cidade: "Contrata Reserva",
            descricao:
                "Apareça no topo do site durante 7 dias e seja visto por mais clientes.",
            preco: "5 créditos",
            whatsappAdmin: "42999806150"
        };

        profissionaisDestaque = [
            propagandaDestaque,
            ...destaquesCadastrados
        ];

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

/* ======================================================
   RENDERIZAR CARROSSEL
====================================================== */

function renderizarCarrossel() {
    if (!carrosselDestaques) {
        return;
    }

    carrosselDestaques.innerHTML =
        profissionaisDestaque
            .map((profissional, indice) => {
                const classeAtivo =
                    indice === destaqueAtual
                        ? "ativo"
                        : "";

                if (profissional.tipo === "propaganda") {
                    const numeroAdmin = somenteNumeros(
                        profissional.whatsappAdmin
                    );

                    const mensagem = encodeURIComponent(
                        "Olá! Vi no Contrata Reserva a opção de colocar meu perfil em destaque por 7 dias. Gostaria de saber como funciona."
                    );

                    return `
                        <article
                            class="card-destaque card-propaganda ${classeAtivo}"
                        >
                            <div class="propaganda-icone">
                                ⭐
                            </div>

                            <div
                                class="conteudo-destaque propaganda-conteudo"
                            >
                                <span class="categoria-destaque">
                                    ${escaparHTML(
                                        profissional.categoria
                                    )}
                                </span>

                                <h3>
                                    Seu serviço merece destaque
                                </h3>

                                <p class="chamada-propaganda">
                                    Apareça no topo do
                                    Contrata Reserva e alcance
                                    mais clientes da cidade.
                                </p>

                                <div class="preco-destaque">
                                    <span>Apenas</span>

                                    <strong>
                                        ${escaparHTML(
                                            profissional.preco
                                        )}
                                    </strong>

                                    <span>por 7 dias</span>
                                </div>

                                <a
                                    class="btn-contatar-destaque"
                                    href="https://wa.me/55${numeroAdmin}?text=${mensagem}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Quero colocar meu perfil
                                    em destaque
                                </a>
                            </div>
                        </article>
                    `;
                }

                const inicial = String(
                    profissional.nome || "P"
                )
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                const foto = profissional.foto
                    ? `
                        <img
                            src="${escaparAtributo(
                                profissional.foto
                            )}"
                            alt="Foto de ${escaparAtributo(
                                profissional.nome ||
                                "profissional"
                            )}"
                        >
                    `
                    : `
                        <div class="avatar-inicial">
                            ${escaparHTML(inicial)}
                        </div>
                    `;

                const linkWhatsapp =
                    profissional.whatsapp
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
                        class="card-destaque ${classeAtivo}"
                    >
                        <div class="selo-destaque">
                            ★ Destaque
                        </div>

                        <div class="foto-destaque">
                            ${foto}
                        </div>

                        <div class="conteudo-destaque">
                            <span class="categoria-destaque">
                                ${escaparHTML(
                                    profissional.servico ||
                                    profissional.categoria ||
                                    "Profissional"
                                )}
                            </span>

                            <h3>
                                ${escaparHTML(
                                    profissional.nome ||
                                    "Profissional"
                                )}
                            </h3>

                            <p class="cidade-destaque">
                                📍 ${escaparHTML(
                                    profissional.cidade ||
                                    "Reserva - PR"
                                )}
                            </p>

                            <p class="descricao-destaque">
                                ${escaparHTML(
                                    profissional.descricao ||
                                    "Profissional disponível no Contrata Reserva."
                                )}
                            </p>

                            ${linkWhatsapp}
                        </div>
                    </article>
                `;
            })
            .join("");

    renderizarIndicadores();
}

function renderizarIndicadores() {
    if (!indicadoresCarrossel) {
        return;
    }

    indicadoresCarrossel.innerHTML =
        profissionaisDestaque
            .map(
                (_, indice) => `
                    <button
                        class="indicador ${
                            indice === destaqueAtual
                                ? "ativo"
                                : ""
                        }"
                        data-indice="${indice}"
                        aria-label="Abrir destaque ${
                            indice + 1
                        }"
                    ></button>
                `
            )
            .join("");
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

/* ======================================================
   EVENTOS DO CARROSSEL
====================================================== */

if (botaoAnterior) {
    botaoAnterior.addEventListener("click", () => {
        mostrarDestaque(destaqueAtual - 1);
        iniciarCarrosselAutomatico();
    });
}

if (botaoProximo) {
    botaoProximo.addEventListener("click", () => {
        mostrarDestaque(destaqueAtual + 1);
        iniciarCarrosselAutomatico();
    });
}

if (indicadoresCarrossel) {
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
}
/* ======================================================
   CARREGAR ANÚNCIOS DE SERVIÇOS
====================================================== */

async function carregar() {
    if (!lista) {
        return;
    }

    lista.innerHTML =
        "<p>Carregando serviços...</p>";

    try {
        const consulta = query(
            collection(db, "anuncios"),
            where(
                "expiraEm",
                ">",
                Timestamp.now()
            ),
            orderBy("expiraEm"),
            orderBy("criadoEm", "desc")
        );

        const snapshot = await getDocs(consulta);

        lista.innerHTML = "";

        if (snapshot.empty) {
            lista.innerHTML =
                "<p>Nenhum serviço publicado no momento.</p>";

            return;
        }

        snapshot.forEach((documento) => {
            const anuncio = documento.data();

            if (
                !anuncio.expiraEm ||
                typeof anuncio.expiraEm.toDate !==
                    "function"
            ) {
                return;
            }

            const agora = Date.now();

            const expiraEm =
                anuncio.expiraEm
                    .toDate()
                    .getTime();

            const diferenca =
                Math.max(0, expiraEm - agora);

            const horas = Math.floor(
                diferenca /
                (1000 * 60 * 60)
            );

            const minutos = Math.floor(
                (
                    diferenca %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );

            const anuncioId =
                escaparTextoInline(documento.id);

            const nome =
                escaparTextoInline(
                    anuncio.nome || ""
                );

            const telefone =
                escaparTextoInline(
                    somenteNumeros(
                        anuncio.telefone
                    )
                );

            lista.innerHTML += `
                <div class="card">
                    <h3>
                        ${escaparHTML(
                            anuncio.titulo ||
                            "Serviço publicado"
                        )}
                    </h3>

                    <p>
                        <b>Categoria:</b>
                        ${escaparHTML(
                            anuncio.categoria ||
                            "Não informada"
                        )}
                    </p>

                    <p>
                        ${escaparHTML(
                            anuncio.descricao || ""
                        )}
                    </p>

                    <p>
                        📍 ${escaparHTML(
                            anuncio.cidade ||
                            "Reserva - PR"
                        )}
                    </p>

                    <p>
                        ⏳ Anúncio expira em
                        ${horas}h ${minutos}min
                    </p>

                    <button
                        type="button"
                        onclick="mostrarContato(
                            '${anuncioId}',
                            '${nome}',
                            '${telefone}'
                        )"
                    >
                        Desbloquear Contato
                    </button>
                </div>
            `;
        });
    } catch (erro) {
        console.error(
            "Erro ao carregar anúncios:",
            erro
        );

        lista.innerHTML =
            "<p>Não foi possível carregar os serviços.</p>";
    }
}

/* ======================================================
   MOSTRAR CONTATO
====================================================== */

window.mostrarContato = async function (
    anuncioId,
    nome,
    telefone
) {
    try {
        if (!usuarioLogado) {
            alert(
                "Faça login para desbloquear contatos."
            );

            return;
        }

        const usuarioRef = doc(
            db,
            "usuarios",
            usuarioLogado.uid
        );

        const usuarioDoc =
            await getDoc(usuarioRef);

        if (!usuarioDoc.exists()) {
            alert(
                "Cadastro do usuário não encontrado."
            );

            return;
        }

        const dados = usuarioDoc.data();

        const desbloqueioId =
            `${usuarioLogado.uid}_${anuncioId}`;

        const desbloqueioRef = doc(
            db,
            "desbloqueios",
            desbloqueioId
        );

        const desbloqueioDoc =
            await getDoc(desbloqueioRef);

        /*
         * Se o contato ainda não foi desbloqueado,
         * usa crédito ou oferece o anúncio.
         */
        if (!desbloqueioDoc.exists()) {
            const creditos =
                Number(dados.creditos || 0);

            if (creditos <= 0) {
                const anuncioAssistido =
                    await abrirModalAnuncio();

                if (!anuncioAssistido) {
                    return;
                }

                await registrarDesbloqueioGratuito(
                    desbloqueioRef,
                    anuncioId
                );
            } else {
                await updateDoc(usuarioRef, {
                    creditos: creditos - 1
                });

                await setDoc(
                    desbloqueioRef,
                    {
                        usuarioId:
                            usuarioLogado.uid,

                        anuncioId,

                        formaDesbloqueio:
                            "credito",

                        data:
                            Timestamp.now()
                    }
                );

                console.log(
                    "Crédito descontado."
                );
            }
        } else {
            console.log(
                "Contato já desbloqueado anteriormente."
            );
        }

        abrirModalContato(nome, telefone);
    } catch (erro) {
        console.error(
            "Erro ao desbloquear contato:",
            erro
        );

        alert(
            "Não foi possível desbloquear o contato."
        );
    }
};

/* ======================================================
   MODAL DO CONTATO
====================================================== */

function abrirModalContato(nome, telefone) {
    const nomeCliente =
        document.getElementById("nomeCliente");

    const telefoneCliente =
        document.getElementById(
            "telefoneCliente"
        );

    const btnWhatsapp =
        document.getElementById("btnWhatsapp");

    const modal =
        document.getElementById("modal");

    if (
        !nomeCliente ||
        !telefoneCliente ||
        !btnWhatsapp ||
        !modal
    ) {
        console.error(
            "Elementos do modal de contato não encontrados."
        );

        return;
    }

    nomeCliente.innerHTML =
        `<b>Nome:</b> ${escaparHTML(nome)}`;

    telefoneCliente.innerHTML =
        `<b>Telefone:</b> ${escaparHTML(
            telefone
        )}`;

    const mensagem =
        "Olá! Vi seu anúncio de serviço no site " +
        "Contrata Reserva e estou interessado. " +
        "Podemos combinar o preço?";

    btnWhatsapp.href =
        `https://wa.me/55${somenteNumeros(
            telefone
        )}?text=${encodeURIComponent(
            mensagem
        )}`;

    modal.style.display = "block";
}

window.fecharModal = function () {
    const modal =
        document.getElementById("modal");

    if (modal) {
        modal.style.display = "none";
    }
};

/* ======================================================
   CARREGAR ANÚNCIO ATIVO DO FIRESTORE
====================================================== */

async function carregarProximoAnuncioAtivo() {

    const snapshot = await getDocs(
        query(
            collection(db, "anunciosVideos"),
            where("ativo", "==", true)
        )
    );

    if (snapshot.empty) {
        return null;
    }

    /*
     * Cria uma sequência estável.
     * Os anúncios mais antigos aparecem primeiro.
     */
    const anunciosAtivos = snapshot.docs
        .map((documento) => ({
            id: documento.id,
            ...documento.data()
        }))
        .sort((a, b) => {

            const dataA =
                a.criadoEm?.toMillis?.() || 0;

            const dataB =
                b.criadoEm?.toMillis?.() || 0;

            if (dataA !== dataB) {
                return dataA - dataB;
            }

            return a.id.localeCompare(b.id);
        });

    /*
     * Recupera qual anúncio deve ser exibido agora.
     */
    const chaveIndice =
        "indiceProximoAnuncioContrata";

    const indiceSalvo = Number(
        localStorage.getItem(chaveIndice) || 0
    );

    const indiceAtual =
        Number.isInteger(indiceSalvo) &&
        indiceSalvo >= 0
            ? indiceSalvo %
                anunciosAtivos.length
            : 0;

    anuncioAtual =
        anunciosAtivos[indiceAtual];

    /*
     * Prepara o próximo anúncio.
     */
    const proximoIndice =
        (indiceAtual + 1) %
        anunciosAtivos.length;

    localStorage.setItem(
        chaveIndice,
        String(proximoIndice)
    );

    return anuncioAtual;
}

/* ======================================================
   REGISTRAR DESBLOQUEIO PELO ANÚNCIO
====================================================== */

async function registrarDesbloqueioGratuito(
    desbloqueioRef,
    anuncioId
) {
    await setDoc(
        desbloqueioRef,
        {
            usuarioId:
                usuarioLogado.uid,

            anuncioId,

            anuncioVideoId:
                anuncioAtual?.id || null,

            empresaAnunciante:
                anuncioAtual?.empresa || null,

            tituloAnuncio:
                anuncioAtual?.titulo || null,

            youtubeId:
                anuncioAtual?.youtubeId || null,

            formaDesbloqueio:
                "anuncio",

            data:
                Timestamp.now()
        }
    );

    console.log(
        "Contato desbloqueado após anúncio."
    );
}

/* ======================================================
   AGUARDAR API DO YOUTUBE
====================================================== */

function aguardarApiYoutube(
    limiteMs = 10000
) {
    return new Promise(
        (resolve, reject) => {
            const inicio = Date.now();

            function verificar() {
                if (
                    window.YT &&
                    typeof window.YT.Player ===
                        "function"
                ) {
                    resolve();
                    return;
                }

                if (
                    Date.now() - inicio >=
                    limiteMs
                ) {
                    reject(
                        new Error(
                            "A API do YouTube não carregou a tempo."
                        )
                    );

                    return;
                }

                setTimeout(verificar, 200);
            }

            verificar();
        }
    );
}
/* ======================================================
   MODAL DO ANÚNCIO DO YOUTUBE
====================================================== */

async function abrirModalAnuncio() {
    let anuncio;

    try {
        anuncio = await carregarProximoAnuncioAtivo();
    } catch (erro) {
        console.error(
            "Erro ao buscar anúncio ativo:",
            erro
        );

        alert(
            "Não foi possível buscar o anúncio."
        );

        return false;
    }

    if (!anuncio || !anuncio.youtubeId) {
        alert(
            "Nenhum anúncio está disponível no momento."
        );

        return false;
    }

    try {
        await aguardarApiYoutube();
    } catch (erro) {
        console.error(erro);

        alert(
            "Não foi possível carregar o player do YouTube."
        );

        return false;
    }

    return new Promise((resolve) => {
        const modalAnuncio =
            document.getElementById(
                "modalAnuncio"
            );

        const btnAssistir =
            document.getElementById(
                "btnAssistirAnuncio"
            );

        const btnCancelar =
            document.getElementById(
                "btnCancelarAnuncio"
            );

        const tempoAnuncio =
            document.getElementById(
                "tempoAnuncio"
            );

        const textoModalAnuncio =
            document.getElementById(
                "textoModalAnuncio"
            );

        let playerBox =
            document.getElementById(
                "playerAnuncio"
            );

        if (
            !modalAnuncio ||
            !btnAssistir ||
            !btnCancelar ||
            !tempoAnuncio ||
            !playerBox
        ) {
            console.error(
                "Elementos do modal de anúncio não encontrados."
            );

            resolve(false);
            return;
        }

        let finalizado = false;
        let videoIniciado = false;
        let maiorTempoAssistido = 0;
        let intervaloVerificacao = null;

        if (textoModalAnuncio) {
            const empresa =
                anuncio.empresa ||
                "Anunciante";

            const titulo =
                anuncio.titulo ||
                "Assista ao vídeo completo para desbloquear o contato.";

            textoModalAnuncio.textContent =
                `${empresa}: ${titulo}`;
        }

        playerBox.style.display = "none";

        /* ==================================================
           LIMPAR PLAYER
        ================================================== */

        function limparPlayer() {
            if (intervaloVerificacao) {
                clearInterval(
                    intervaloVerificacao
                );

                intervaloVerificacao = null;
            }

            if (
                playerAnuncio &&
                typeof playerAnuncio.destroy ===
                    "function"
            ) {
                try {
                    playerAnuncio.destroy();
                } catch (erro) {
                    console.warn(
                        "Não foi possível destruir o player:",
                        erro
                    );
                }
            }

            playerAnuncio = null;

            /*
             * O método destroy() pode remover o elemento
             * original. Por isso recriamos a div.
             */
            if (
                !document.getElementById(
                    "playerAnuncio"
                )
            ) {
                const novoPlayer =
                    document.createElement(
                        "div"
                    );

                novoPlayer.id =
                    "playerAnuncio";

                novoPlayer.className =
                    "video-anuncio";

                novoPlayer.style.display =
                    "none";

                tempoAnuncio.before(
                    novoPlayer
                );
            }
        }

        /* ==================================================
           FINALIZAR MODAL
        ================================================== */

        function finalizar(resultado) {
            if (finalizado) {
                return;
            }

            finalizado = true;

            limparPlayer();

            modalAnuncio.style.display =
                "none";

            btnAssistir.disabled = false;
            btnCancelar.disabled = false;

            btnCancelar.style.display =
                "inline-block";

            btnAssistir.textContent =
                "Assistir anúncio";

            tempoAnuncio.textContent =
                "Clique em assistir para começar.";

            btnAssistir.onclick = null;
            btnCancelar.onclick = null;

            resolve(resultado);
        }

        /* ==================================================
           CANCELAR ANÚNCIO
        ================================================== */

        btnCancelar.onclick = () => {
            if (videoIniciado) {
                return;
            }

            finalizar(false);
        };

        /* ==================================================
           INICIAR ANÚNCIO
        ================================================== */

        btnAssistir.onclick = () => {
            if (videoIniciado) {
                return;
            }

            videoIniciado = true;

            btnAssistir.disabled = true;
            btnCancelar.disabled = true;

            btnCancelar.style.display =
                "none";

            btnAssistir.textContent =
                "Assistindo...";

            tempoAnuncio.textContent =
                "Assista ao vídeo até o final.";

            playerBox =
                document.getElementById(
                    "playerAnuncio"
                );

            if (!playerBox) {
                alert(
                    "O espaço do vídeo não foi encontrado."
                );

                finalizar(false);
                return;
            }

            playerBox.style.display =
                "block";

            /* ==============================================
               CRIAR PLAYER DO YOUTUBE
            ============================================== */

            playerAnuncio =
                new window.YT.Player(
                    "playerAnuncio",
                    {
                        width: "100%",
                        height: "315",

                        videoId:
                            anuncio.youtubeId,

                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            rel: 0,
                            playsinline: 1,
                            modestbranding: 1
                        },

                        events: {
                            /* ==================================
                               PLAYER PRONTO
                            ================================== */

                            async onReady(evento) {

                                await updateDoc(
                                    doc(db, "anunciosVideos", anuncio.id),{
                                        visualizacoes: increment(1)
                                    });
                                evento.target.playVideo();

                                intervaloVerificacao =
                                    setInterval(
                                        () => {
                                            if (
                                                !playerAnuncio ||
                                                typeof playerAnuncio
                                                    .getCurrentTime !==
                                                    "function"
                                            ) {
                                                return;
                                            }

                                            const tempoAtual =
                                                playerAnuncio
                                                    .getCurrentTime() ||
                                                0;

                                            const duracao =
                                                playerAnuncio
                                                    .getDuration() ||
                                                0;

                                            /*
                                             * Se o usuário tentar avançar
                                             * mais de 2 segundos, retorna
                                             * para o último ponto assistido.
                                             */
                                            if (
                                                tempoAtual >
                                                maiorTempoAssistido +
                                                    2
                                            ) {
                                                playerAnuncio
                                                    .seekTo(
                                                        maiorTempoAssistido,
                                                        true
                                                    );

                                                return;
                                            }

                                            maiorTempoAssistido =
                                                Math.max(
                                                    maiorTempoAssistido,
                                                    tempoAtual
                                                );

                                            if (
                                                duracao >
                                                0
                                            ) {
                                                const restante =
                                                    Math.max(
                                                        0,
                                                        Math.ceil(
                                                            duracao -
                                                            tempoAtual
                                                        )
                                                    );

                                                tempoAnuncio
                                                    .textContent =
                                                    `Tempo restante: ${restante} segundos`;
                                            }
                                        },
                                        500
                                    );
                            },

                            /* ==================================
                               ALTERAÇÃO DE ESTADO
                            ================================== */

                            async onStateChange(evento) {
                                /*
                                 * Se o usuário pausar,
                                 * o vídeo volta a tocar.
                                 */
                                if (
                                    evento.data ===
                                        window.YT
                                            .PlayerState
                                            .PAUSED &&
                                    !finalizado
                                ) {
                                    try {
                                        playerAnuncio
                                            .playVideo();
                                    } catch (
                                        erro
                                    ) {
                                        console.warn(
                                            "Não foi possível continuar o vídeo:",
                                            erro
                                        );
                                    }
                                }

                                /*
                                 * Somente libera quando o
                                 * vídeo cadastrado termina.
                                 */
                                if (
                                    evento.data ===
                                    window.YT
                                        .PlayerState
                                        .ENDED
                                ) {
                                    tempoAnuncio
                                        .textContent =
                                        "Anúncio concluído! Liberando contato...";
                                    await updateDoc(
    doc(db, "anunciosVideos", anuncio.id),
    {
        conclusoes: increment(1)
    }
);
                                    setTimeout(
                                        () => {
                                            finalizar(
                                                true
                                            );
                                        },
                                        500
                                    );
                                }
                            },

                            /* ==================================
                               ERRO NO VÍDEO
                            ================================== */

                            onError(erro) {
                                console.error(
                                    "Erro no vídeo do YouTube:",
                                    erro.data
                                );

                                alert(
                                    "Não foi possível reproduzir este anúncio."
                                );

                                finalizar(false);
                            }
                        }
                    }
                );
        };

        modalAnuncio.style.display =
            "block";
    });
}

/* ======================================================
   INICIALIZAÇÃO
====================================================== */

carregarDestaques();
carregar();