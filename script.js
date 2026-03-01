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

function abrirModal(loja, mes, datasets) {
    const modal = document.getElementById("modal-dados");
    const titulo = document.getElementById("modal-titulo");
    const json = document.getElementById("modal-json");

    titulo.textContent = `${loja} - ${mes}`;
    json.textContent = JSON.stringify(datasets, null, 2);

    modal.classList.add("open");
}

document.getElementById("btn-fechar").addEventListener("click", () => {
    document.getElementById("modal-dados").classList.remove("open");
});

function criarGrafico(idCanvas, titulo, labels, datasets) {

    const canvas = document.getElementById(idCanvas);

    // Destruir gráfico anterior se existir
    const chartExistente = Chart.getChart(canvas);
    if (chartExistente) {
        chartExistente.destroy();
    }

    new Chart(canvas, {
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
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    abrirModal(titulo, labels[index], datasets);
                }
            }
        }
    });
}

function prepararSeries(dadosLoja) {

    const mesesOrd = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const anos = [...new Set(dadosLoja.map(d => d.Ano))].sort((a,b)=>a-b);

    const datasets = anos.map(ano => {

        const valores = new Array(12).fill(null);

        dadosLoja.forEach(item => {
            const idx = mesesOrd.indexOf(item["Mês"]);
            if (idx >= 0 && item.Ano === ano) {
                valores[idx] = Number(item.Perdas) || 0;
            }
        });

        return {
            label: ano,
            data: valores,
            borderWidth: 2,
            tension: 0.3,
            fill: false
        };
    });

    return { mesesOrd, datasets };
}

async function montarGraficos() {

    const dados = await carregarDados();
    const lojas = agruparPorLoja(dados);

    const mesesOrd = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const anosGlobais = [...new Set(dados.map(d => d.Ano))].sort((a,b)=>a-b);

    const datasetsGerais = anosGlobais.map(ano => {

        const valores = new Array(12).fill(0);

        dados.forEach(item => {
            if (item.Ano === ano) {
                const idx = mesesOrd.indexOf(item["Mês"]);
                if (idx >= 0) {
                    valores[idx] += Number(item.Perdas) || 0;
                }
            }
        });

        return {
            label: ano,
            data: valores,
            borderWidth: 2,
            tension: 0.3,
            fill: false
        };
    });

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral de Perdas",
        mesesOrd,
        datasetsGerais
    );

    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(lojas).forEach(lojaNome => {

        const lojaDados = lojas[lojaNome];
        const { mesesOrd, datasets } = prepararSeries(lojaDados);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas = `grafico-${lojaNome.replace(/[^a-zA-Z0-9]/g, "")}`;

        div.innerHTML = `
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(idCanvas, lojaNome, mesesOrd, datasets);
    });
}

montarGraficos();