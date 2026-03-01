async function carregarDados() {
    const resposta = await fetch("perdas.json");
    return resposta.json();
}

function agruparPorLoja(dados) {
    const lojas = {};

    dados.forEach(item => {
        if (!lojas[item.Loja]) {
            lojas[item.Loja] = [];
        }
        lojas[item.Loja].push(item);
    });

    return lojas;
}

function obterAnos(dados) {
    const anos = [...new Set(dados.map(d => d.Ano))];
    return anos.sort();
}

function criarGrafico(idCanvas, titulo, labels, datasets) {
    new Chart(document.getElementById(idCanvas), {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: titulo }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return "R$ " + value.toLocaleString("pt-BR");
                        }
                    }
                }
            }
        }
    });
}

function prepararSeries(dadosLoja, anos) {
    const mesesOrd = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const series = {};

    anos.forEach(ano => {
        series[ano] = new Array(12).fill(0);
    });

    dadosLoja.forEach(item => {
        const idx = mesesOrd.indexOf(item.Mês);
        if (idx >= 0 && series[item.Ano]) {
            series[item.Ano][idx] = item.Perdas;
        }
    });

    return { mesesOrd, series };
}

async function montarGraficos() {
    const dados = await carregarDados();
    const lojas = agruparPorLoja(dados);
    const anos = obterAnos(dados);

    // --- GRÁFICO GERAL ---
    const mesesOrd = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const totais = {};
    anos.forEach(ano => totais[ano] = new Array(12).fill(0));

    Object.values(lojas).forEach(loja => {
        const { series } = prepararSeries(loja, anos);

        anos.forEach(ano => {
            series[ano].forEach((valor, i) => {
                totais[ano][i] += valor;
            });
        });
    });

    const datasetsGeral = anos.map(ano => ({
        label: ano.toString(),
        data: totais[ano],
        borderWidth: 2,
        tension: 0.3
    }));

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral de Perdas",
        mesesOrd,
        datasetsGeral
    );

    // --- GRÁFICOS POR LOJA ---
    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(lojas).forEach(lojaNome => {
        const lojaDados = lojas[lojaNome];
        const { mesesOrd, series } = prepararSeries(lojaDados, anos);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas = `grafico-${lojaNome.replace(/\s+/g, "")}`;

        div.innerHTML = `
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        const datasets = anos.map(ano => ({
            label: ano.toString(),
            data: series[ano],
            borderWidth: 2,
            tension: 0.3
        }));

        criarGrafico(idCanvas, lojaNome, mesesOrd, datasets);
    });
}

montarGraficos();