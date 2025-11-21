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

function criarGrafico(idCanvas, titulo, labels, valores2024, valores2025) {
    new Chart(document.getElementById(idCanvas), {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "2024",
                    data: valores2024,
                    borderWidth: 2
                },
                {
                    label: "2025",
                    data: valores2025,
                    borderWidth: 2
                }
            ]
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

    const valores2024 = new Array(12).fill(null);
    const valores2025 = new Array(12).fill(null);

    dadosLoja.forEach(item => {
        const idx = mesesOrd.indexOf(item.Mês);
        if (idx >= 0) {
            if (item.Ano === 2024) valores2024[idx] = item.Perdas;
            if (item.Ano === 2025) valores2025[idx] = item.Perdas;
        }
    });

    return { mesesOrd, valores2024, valores2025 };
}

async function montarGraficos() {
    const dados = await carregarDados();
    const lojas = agruparPorLoja(dados);

    // --- GRÁFICO GERAL ---
    const todas2024 = [];
    const todas2025 = [];

    Object.values(lojas).forEach(loja => {
        const group = prepararSeries(loja);
        group.valores2024.forEach(v => todas2024.push(v));
        group.valores2025.forEach(v => todas2025.push(v));
    });

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral de Perdas",
        Array.from({ length: 12 }, (_, i) => i + 1),
        todas2024,
        todas2025
    );

    // --- GRÁFICOS POR LOJA ---
    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(lojas).forEach(lojaNome => {
        const lojaDados = lojas[lojaNome];
        const { mesesOrd, valores2024, valores2025 } = prepararSeries(lojaDados);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas = `grafico-${lojaNome.replace(" ", "")}`;

        div.innerHTML = `
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(idCanvas, lojaNome, mesesOrd, valores2024, valores2025);
    });
}

montarGraficos();
