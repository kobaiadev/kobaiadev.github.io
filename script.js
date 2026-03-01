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
            }
        }
    });
}

function prepararSeries(dadosLoja) {

    const mesesOrd = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    // Descobre anos existentes automaticamente
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

    // --- GRÁFICO GERAL ---
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

    // --- GRÁFICOS POR LOJA ---
    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(lojas).forEach(lojaNome => {

        const lojaDados = lojas[lojaNome];
        const { mesesOrd, datasets } = prepararSeries(lojaDados);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas = `grafico-${lojaNome.replace(/\s/g, "")}`;

        div.innerHTML = `
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(idCanvas, lojaNome, mesesOrd, datasets);
    });
}

montarGraficos();