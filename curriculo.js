/* =====================================================
   CONTRATA RESERVA - GERADOR DE CURRÍCULOS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CORRETOR ORTOGRÁFICO DO NAVEGADOR
    ===================================================== */

    document
        .querySelectorAll('input[type="text"], textarea')
        .forEach(campo => {
            campo.setAttribute("spellcheck", "true");
            campo.setAttribute("lang", "pt-BR");
        });


    const form = document.getElementById("formCurriculo");
    const etapas = [...document.querySelectorAll(".etapa")];

    const barra = document.getElementById("barraProgresso");
    const textoProgresso = document.getElementById("textoProgresso");
    const porcentagemProgresso =
        document.getElementById("porcentagemProgresso");

    let etapaAtual = 1;

    let possuiCursos = null;
    let possuiExperiencia = null;


    /* =================================================
       NAVEGAÇÃO
    ================================================= */

    function mostrarEtapa(numero) {

        etapas.forEach(etapa => {
            etapa.classList.remove("ativa");
        });

        const novaEtapa =
            document.querySelector(`[data-etapa="${numero}"]`);

        if (!novaEtapa) return;

        novaEtapa.classList.add("ativa");

        etapaAtual = numero;

        atualizarProgresso();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    function atualizarProgresso() {

        const total = etapas.length;

        const porcentagem =
            Math.round(((etapaAtual - 1) / (total - 1)) * 100);

        barra.style.width = `${porcentagem}%`;

        textoProgresso.textContent =
            `Etapa ${etapaAtual} de ${total}`;

        porcentagemProgresso.textContent =
            `${porcentagem}%`;
    }


    /* =================================================
       VALIDAÇÃO DA ETAPA
    ================================================= */

    function validarEtapa() {

        const etapa =
            document.querySelector(
                `[data-etapa="${etapaAtual}"]`
            );

        removerErros(etapa);

        const obrigatorios =
            etapa.querySelectorAll("[required]");

        for (const campo of obrigatorios) {

            if (!campo.value.trim()) {

                mostrarErro(
                    campo,
                    "Preencha este campo para continuar."
                );

                campo.focus();

                return false;
            }

            if (
                campo.type === "email" &&
                campo.value &&
                !campo.checkValidity()
            ) {

                mostrarErro(
                    campo,
                    "Digite um e-mail válido."
                );

                campo.focus();

                return false;
            }
        }


        /* Cursos */

        if (etapaAtual === 7) {

            if (possuiCursos === null) {

                alert(
                    "Informe se você possui cursos ou qualificações."
                );

                return false;
            }

            if (
                possuiCursos === true &&
                !document
                    .getElementById("cursos")
                    .value
                    .trim()
            ) {

                mostrarErro(
                    document.getElementById("cursos"),
                    "Informe pelo menos um curso ou qualificação."
                );

                return false;
            }
        }


        /* Experiência */

        if (etapaAtual === 8) {

            if (possuiExperiencia === null) {

                alert(
                    "Informe se você já trabalhou anteriormente."
                );

                return false;
            }

            if (possuiExperiencia === true) {

                const experiencias =
                    document.querySelectorAll(".experiencia");

                for (const experiencia of experiencias) {

                    const empresa =
                        experiencia.querySelector(".empresa");

                    const funcao =
                        experiencia.querySelector(".funcao");

                    if (!empresa.value.trim()) {

                        mostrarErro(
                            empresa,
                            "Informe o nome da empresa."
                        );

                        empresa.focus();

                        return false;
                    }

                    if (!funcao.value.trim()) {

                        mostrarErro(
                            funcao,
                            "Informe a função exercida."
                        );

                        funcao.focus();

                        return false;
                    }
                }
            }
        }

        return true;
    }


    function mostrarErro(campo, mensagem) {

        campo.classList.add("campo-erro");

        const erro = document.createElement("span");

        erro.className = "mensagem-erro";
        erro.textContent = mensagem;

        campo.insertAdjacentElement("afterend", erro);
    }


    function removerErros(container) {

        container
            .querySelectorAll(".campo-erro")
            .forEach(campo => {
                campo.classList.remove("campo-erro");
            });

        container
            .querySelectorAll(".mensagem-erro")
            .forEach(erro => erro.remove());
    }


    /* =================================================
       BOTÕES CONTINUAR
    ================================================= */

    document
        .querySelectorAll(".btn-proximo")
        .forEach(botao => {

            botao.addEventListener("click", () => {

                if (!validarEtapa()) return;

                if (etapaAtual < etapas.length) {

                    mostrarEtapa(etapaAtual + 1);

                    if (etapaAtual === 10) {
                        gerarResumo();
                    }
                }
            });
        });


    /* =================================================
       BOTÕES VOLTAR
    ================================================= */

    document
        .querySelectorAll(".btn-voltar")
        .forEach(botao => {

            botao.addEventListener("click", () => {

                if (etapaAtual > 1) {
                    mostrarEtapa(etapaAtual - 1);
                }
            });
        });


    /* =================================================
       CURSOS - SIM / NÃO
    ================================================= */

    const botoesCursos =
        document.querySelectorAll("[data-cursos]");

    const areaCursos =
        document.getElementById("areaCursos");


    botoesCursos.forEach(botao => {

        botao.addEventListener("click", () => {

            botoesCursos.forEach(b => {
                b.classList.remove("selecionada");
            });

            botao.classList.add("selecionada");

            if (botao.dataset.cursos === "sim") {

                possuiCursos = true;

                areaCursos.classList.add("visivel");

            } else {

                possuiCursos = false;

                areaCursos.classList.remove("visivel");

                document.getElementById("cursos").value = "";
            }
        });
    });


    /* =================================================
       EXPERIÊNCIA - SIM / NÃO
    ================================================= */

    const botoesExperiencia =
        document.querySelectorAll("[data-experiencia]");

    const areaExperiencias =
        document.getElementById("areaExperiencias");


    botoesExperiencia.forEach(botao => {

        botao.addEventListener("click", () => {

            botoesExperiencia.forEach(b => {
                b.classList.remove("selecionada");
            });

            botao.classList.add("selecionada");

            if (
                botao.dataset.experiencia === "sim"
            ) {

                possuiExperiencia = true;

                areaExperiencias.classList.add("visivel");

            } else {

                possuiExperiencia = false;

                areaExperiencias.classList.remove("visivel");
            }
        });
    });


    /* =================================================
       ADICIONAR EXPERIÊNCIA
    ================================================= */

    const botaoAdicionar =
        document.getElementById("adicionarExperiencia");

    const listaExperiencias =
        document.getElementById("listaExperiencias");


    botaoAdicionar.addEventListener("click", () => {

        const experiencia =
            document.createElement("div");

        experiencia.className = "experiencia";

        experiencia.innerHTML = `

            <label>Empresa</label>

            <input
                type="text"
                class="empresa"
                placeholder="Nome da empresa"
            >

            <label>Função</label>

            <input
                type="text"
                class="funcao"
                placeholder="Ex: Auxiliar de produção"
            >

            <label>Período</label>

            <input
                type="text"
                class="periodo"
                placeholder="Ex: Janeiro de 2024 a Junho de 2025"
            >

            <label>Principais atividades</label>

            <textarea
                class="atividades"
                rows="4"
                placeholder="Conte brevemente o que você fazia."
            ></textarea>

            <button
                type="button"
                class="btn-remover-experiencia"
            >
                Remover experiência
            </button>

        `;

        listaExperiencias.appendChild(experiencia);


        experiencia
            .querySelector(".btn-remover-experiencia")
            .addEventListener("click", () => {

                experiencia.remove();

            });

    });


    /* =================================================
       PEGAR EXPERIÊNCIAS
    ================================================= */

    function obterExperiencias() {

        const resultado = [];

        if (!possuiExperiencia) {
            return resultado;
        }

        document
            .querySelectorAll(".experiencia")
            .forEach(experiencia => {

                resultado.push({

                    empresa:
                        experiencia
                            .querySelector(".empresa")
                            .value
                            .trim(),

                    funcao:
                        experiencia
                            .querySelector(".funcao")
                            .value
                            .trim(),

                    periodo:
                        experiencia
                            .querySelector(".periodo")
                            .value
                            .trim(),

                    atividades:
                        experiencia
                            .querySelector(".atividades")
                            .value
                            .trim()

                });

            });

        return resultado;
    }


    /* =================================================
       RESUMO
    ================================================= */

    function gerarResumo() {

        const resumo =
            document.getElementById("resumoCurriculo");

        const nome =
            document.getElementById("nome").value;

        const telefone =
            document.getElementById("telefone").value;

        const cidade =
            document.getElementById("cidade").value;

        const objetivo =
            document.getElementById("objetivo").value;

        resumo.innerHTML = `

            <strong>${escaparHTML(nome)}</strong>

            <br>

            ${escaparHTML(telefone)}

            <br>

            ${escaparHTML(cidade)}

            <br><br>

            <strong>Objetivo:</strong>

            ${escaparHTML(objetivo)}

        `;
    }


    function escaparHTML(texto) {

        const div = document.createElement("div");

        div.textContent = texto;

        return div.innerHTML;
    }


    /* =================================================
       TELEFONE
    ================================================= */

    const telefone =
        document.getElementById("telefone");

    telefone.addEventListener("input", () => {

        let valor =
            telefone.value.replace(/\D/g, "");

        valor = valor.substring(0, 11);

        if (valor.length > 10) {

            valor = valor.replace(
                /^(\d{2})(\d{5})(\d{4})$/,
                "($1) $2-$3"
            );

        } else if (valor.length > 6) {

            valor = valor.replace(
                /^(\d{2})(\d{4})(\d+)/,
                "($1) $2-$3"
            );

        } else if (valor.length > 2) {

            valor = valor.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );

        }

        telefone.value = valor;
    });


    /* =================================================
       CONVERTER LOGO PARA BASE64
    ================================================= */

    function carregarImagemBase64(caminho) {

        return new Promise((resolve, reject) => {

            const imagem = new Image();

            imagem.onload = () => {

                const canvas =
                    document.createElement("canvas");

                canvas.width = imagem.naturalWidth;
                canvas.height = imagem.naturalHeight;

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(imagem, 0, 0);

                resolve(
                    canvas.toDataURL(
                        "image/png"
                    )
                );
            };

            imagem.onerror = reject;

            imagem.src = caminho;
        });
    }


    /* =================================================
       FORMATAÇÃO DA DATA
    ================================================= */

    function formatarData(data) {

        if (!data) return "";

        const partes = data.split("-");

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }


    /* =================================================
       GERAR PDF
    ================================================= */

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const botao =
            document.getElementById("gerarCurriculo");

        botao.disabled = true;
        botao.textContent = "Gerando currículo...";

        try {

            await gerarPDF();

        } catch (erro) {

            console.error(erro);

            alert(
                "Não foi possível gerar o currículo. Tente novamente."
            );

        } finally {

            botao.disabled = false;
            botao.textContent = "Gerar meu currículo";
        }
    });


    async function gerarPDF() {

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


        /* =============================================
           DADOS
        ============================================= */

        const nome =
            document.getElementById("nome")
                .value.trim();

        const telefone =
            document.getElementById("telefone")
                .value.trim();

        const email =
            document.getElementById("email")
                .value.trim();

        const cidade =
            document.getElementById("cidade")
                .value.trim();

        const bairro =
            document.getElementById("bairro")
                .value.trim();

        const nascimento =
            document.getElementById("nascimento")
                .value;

        const escolaridade =
            document.getElementById("escolaridade")
                .value;

        const cursos =
            document.getElementById("cursos")
                .value.trim();

        const objetivo =
            document.getElementById("objetivo")
                .value.trim();

        const experiencias =
            obterExperiencias();


        /* =============================================
           CONFIGURAÇÕES
        ============================================= */

        const margem = 20;

        const larguraPagina = 210;

        const larguraTexto =
            larguraPagina - (margem * 2);

        let y = 20;


        /* =============================================
           MARCA D'ÁGUA
        ============================================= */

        try {

            const logo =
                await carregarImagemBase64(
                    "img/logo-contrata.png"
                );

            doc.saveGraphicsState();

            doc.setGState(
                new doc.GState({
                    opacity: 0.15
                })
            );

            /*
               Logo grande no centro da página.
            */

            doc.addImage(
                logo,
                "PNG",
                35,
                105,
                140,
                79
            );

            doc.restoreGraphicsState();

        } catch (erro) {

            console.warn(
                "Logo não encontrada. PDF será gerado sem marca d'água.",
                erro
            );
        }


        /* =============================================
           FUNÇÕES AUXILIARES DO PDF
        ============================================= */

        function tituloSecao(titulo) {

            verificarEspaco(18);

            y += 5;

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(11);

            doc.setTextColor(
                0,
                31,
                77
            );

            doc.text(
                titulo.toUpperCase(),
                margem,
                y
            );

            y += 2;

            doc.setDrawColor(
                67,
                173,
                18
            );

            doc.setLineWidth(0.6);

            doc.line(
                margem,
                y,
                larguraPagina - margem,
                y
            );

            y += 7;

            doc.setTextColor(
                35,
                35,
                35
            );
        }


        function linhaDados(rotulo, valor) {

            if (!valor) return;

            verificarEspaco(8);

            doc.setFontSize(10);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                `${rotulo}:`,
                margem,
                y
            );

            const larguraRotulo =
                doc.getTextWidth(
                    `${rotulo}: `
                );

            doc.setFont(
                "helvetica",
                "normal"
            );

            const linhas =
                doc.splitTextToSize(
                    valor,
                    larguraTexto - larguraRotulo
                );

            doc.text(
                linhas,
                margem + larguraRotulo,
                y
            );

            y +=
                Math.max(
                    6,
                    linhas.length * 5
                );
        }


        function paragrafo(texto) {

            if (!texto) return;

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(10);

            doc.setTextColor(
                35,
                35,
                35
            );

            const linhas =
                doc.splitTextToSize(
                    texto,
                    larguraTexto
                );

            verificarEspaco(
                linhas.length * 5 + 5
            );

            doc.text(
                linhas,
                margem,
                y
            );

            y += linhas.length * 5;
        }


        function verificarEspaco(necessario) {

            if (y + necessario > 275) {

                doc.addPage();

                y = 20;
            }
        }


        /* =============================================
           CABEÇALHO DO CURRÍCULO
        ============================================= */

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(20);

        doc.setTextColor(
            20,
            20,
            20
        );

        doc.text(
            nome.toUpperCase(),
            105,
            y,
            {
                align: "center"
            }
        );

        y += 8;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(9.5);

        doc.setTextColor(
            90,
            90,
            90
        );


        const contato = [
            telefone,
            email,
            `${bairro} - ${cidade}`
        ]
            .filter(Boolean)
            .join("  |  ");


        const linhasContato =
            doc.splitTextToSize(
                contato,
                170
            );


        doc.text(
            linhasContato,
            105,
            y,
            {
                align: "center"
            }
        );


        y +=
            linhasContato.length * 5 + 5;


        doc.setDrawColor(
            200,
            200,
            200
        );

        doc.line(
            margem,
            y,
            190,
            y
        );

        y += 7;


        /* =============================================
           APRESENTAÇÃO
        ============================================= */

        paragrafo(
            "Visando integrar o quadro de funcionários de sua empresa, apresento meu currículo para apreciação e coloco-me à disposição para possíveis oportunidades profissionais."
        );


        /* =============================================
           DADOS PESSOAIS
        ============================================= */

        tituloSecao(
            "Dados pessoais"
        );

        linhaDados(
            "Nome",
            nome
        );

        linhaDados(
            "Telefone",
            telefone
        );

        linhaDados(
            "E-mail",
            email
        );

        linhaDados(
            "Cidade",
            cidade
        );

        linhaDados(
            "Bairro",
            bairro
        );

        if (nascimento) {

            linhaDados(
                "Data de nascimento",
                formatarData(nascimento)
            );
        }


        /* =============================================
           FORMAÇÃO
        ============================================= */

        tituloSecao(
            "Formação escolar"
        );

        paragrafo(
            escolaridade
        );


        /* =============================================
           CURSOS
        ============================================= */

        tituloSecao(
            "Cursos e qualificações"
        );

        if (
            possuiCursos &&
            cursos
        ) {

            const listaCursos =
                cursos
                    .split("\n")
                    .map(curso => curso.trim())
                    .filter(Boolean);

            listaCursos.forEach(curso => {

                verificarEspaco(7);

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(10);

                doc.text(
                    `• ${curso}`,
                    margem + 2,
                    y
                );

                y += 6;
            });

        } else {

            paragrafo(
                "Não informado."
            );
        }


        /* =============================================
           EXPERIÊNCIA PROFISSIONAL
        ============================================= */

        tituloSecao(
            "Experiência profissional"
        );


        if (
            possuiExperiencia &&
            experiencias.length
        ) {

            experiencias.forEach(
                (experiencia, indice) => {

                    verificarEspaco(25);

                    doc.setFont(
                        "helvetica",
                        "bold"
                    );

                    doc.setFontSize(10.5);

                    doc.text(
                        experiencia.funcao,
                        margem,
                        y
                    );

                    y += 5;


                    doc.setFont(
                        "helvetica",
                        "normal"
                    );

                    doc.setFontSize(10);


                    let empresaPeriodo =
                        experiencia.empresa;


                    if (experiencia.periodo) {

                        empresaPeriodo +=
                            ` | ${experiencia.periodo}`;
                    }


                    doc.text(
                        empresaPeriodo,
                        margem,
                        y
                    );

                    y += 5;


                    if (
                        experiencia.atividades
                    ) {

                        const linhas =
                            doc.splitTextToSize(
                                experiencia.atividades,
                                larguraTexto
                            );

                        doc.text(
                            linhas,
                            margem,
                            y
                        );

                        y +=
                            linhas.length * 5;
                    }


                    if (
                        indice <
                        experiencias.length - 1
                    ) {

                        y += 5;
                    }

                }
            );

        } else {

            paragrafo(
                "Em busca da primeira oportunidade profissional."
            );
        }


        /* =============================================
           OBJETIVO
        ============================================= */

        tituloSecao(
            "Objetivo profissional"
        );


        paragrafo(
            `Busco uma oportunidade na área de ${objetivo}, onde possa desenvolver minhas habilidades, adquirir experiência e contribuir com a equipe e com os objetivos da empresa.`
        );


        /* =============================================
           RODAPÉ
        ============================================= */

        const totalPaginas =
            doc.getNumberOfPages();


        for (
            let pagina = 1;
            pagina <= totalPaginas;
            pagina++
        ) {

            doc.setPage(pagina);

            doc.setDrawColor(
                220,
                220,
                220
            );

            doc.line(
                margem,
                284,
                190,
                284
            );


            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(7.5);

            doc.setTextColor(
                140,
                140,
                140
            );


            doc.text(
                "Currículo gerado pela Contrata Reserva",
                105,
                289,
                {
                    align: "center"
                }
            );
        }


        /* =============================================
           DOWNLOAD
        ============================================= */

        const nomeArquivo =
            nome
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
    /^-|-$/g,
    ""
);


        doc.save(
            `curriculo-${nomeArquivo || "contrata"}.pdf`
        );
    }


    /* =================================================
       INICIALIZAÇÃO
    ================================================= */

    mostrarEtapa(1);

});