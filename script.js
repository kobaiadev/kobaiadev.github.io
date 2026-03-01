let dadosGlobais = [];

// =======================
// CARREGAR DADOS
// =======================
async function carregarDados() {
    const resposta = await fetch("perdas.json");
    const dados = await resposta.json();
    dadosGlobais = dados;
    return dados;
}

// =======================
// AGRUPAR POR LOJA E ANO
// =======================
function agruparPorLojaEAno(dados) {
    const resultado = {};

    dados.forEach(item => {
        const loja = item.Loja;
        const ano = item.Ano;
        const valor = Number(item.Perdas) || 0;

        if (!resultado[loja]) resultado[loja] = {};
        if (!resultado[loja][ano]) resultado[loja][ano] = 0;

        resultado[loja][ano] += valor;
    });

    return resultado;
}

// =======================
// GRÁFICO GERAL
// =======================
function gerarGraficoGeral(dadosAgrupados) {

    const lojas = Object.keys(dadosAgrupados).sort();

    const anos = [...new Set(
        Object.values(dadosAgrupados)
        .flatMap(loja => Object.keys(loja))
    )].sort((a,b)=>a-b);

    const datasets = anos.map(ano => ({
        label: ano,
        data: lojas.map(loja => dadosAgrupados[loja][ano] || 0),
        borderWidth: 2
    }));

    new Chart(document.getElementById("graficoGeral"), {
        type: "bar",
        data: {
            labels: lojas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// =======================
// GRÁFICOS POR LOJA
// =======================
function gerarGraficosPorLoja(dadosAgrupados) {

    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(dadosAgrupados)
        .sort()
        .forEach(loja => {

            const div = document.createElement("div");
            div.className = "grafico-container";

            div.innerHTML = `
                <h2>${loja}</h2>
                <canvas id="grafico-loja-${loja.replace(/\s/g,'')}" height="200"></canvas>
                <button onclick="abrirModal('${loja}')">Ver Dados</button>
            `;

            container.appendChild(div);

            const anos = Object.keys(dadosAgrupados[loja])
                .sort((a,b)=>a-b);

            const valores = anos.map(ano => dadosAgrupados[loja][ano]);

            new Chart(
                document.getElementById(`grafico-loja-${loja.replace(/\s/g,'')}`),
                {
                    type: "line",
                    data: {
                        labels: anos,
                        datasets: [{
                            label: loja,
                            data: valores,
                            borderWidth: 2,
                            tension: 0.3,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                }
            );
        });
}

// =======================
// MODAL
// =======================
function abrirModal(loja) {

    const modal = document.getElementById("modal-dados");
    const titulo = document.getElementById("modal-titulo");
    const jsonBox = document.getElementById("modal-json");

    titulo.innerText = `Dados da ${loja}`;

    const dadosLoja = dadosGlobais.filter(d => d.Loja === loja);

    jsonBox.innerText = JSON.stringify(dadosLoja, null, 2);

    modal.classList.add("open");
}

document.getElementById("btn-fechar").addEventListener("click", () => {
    document.getElementById("modal-dados").classList.remove("open");
});

// =======================
// INICIALIZAÇÃO
// =======================
carregarDados().then(dados => {
    const agrupado = agruparPorLojaEAno(dados);
    gerarGraficoGeral(agrupado);
    gerarGraficosPorLoja(agrupado);
});