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

    const ctx = document.getElementById(idCanvas);

    if (!ctx) return;

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "2024",
                    data: valores2024,
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: "2025",
                    data: valores2025,
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: titulo
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

    const valores2024 = new Array(12).fill(null);
    const valores2025 = new Array(12).fill(null);

    dadosLoja.forEach(item => {

        const idx = mesesOrd.indexOf(item.Mês);

        if (idx >= 0) {

            if (item.Ano === 2024)
                valores2024[idx] = Number(item.Perdas) || 0;

            if (item.Ano === 2025)
                valores2025[idx] = Number(item.Perdas) || 0;
        }

    });

    return { mesesOrd, valores2024, valores2025 };
}

async function montarGraficos() {

    const dados = await carregarDados();

    if (!dados || dados.length === 0) return;

    const lojas = agruparPorLoja(dados);

    /* =========================
    GRÁFICO GERAL
    ========================= */

    const mesesLabel = [
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const geral2024 = new Array(12).fill(0);
    const geral2025 = new Array(12).fill(0);

    Object.values(lojas).forEach(loja => {

        const series = prepararSeries(loja);

        series.valores2024.forEach((v,i)=>{
            geral2024[i] += v || 0;
        });

        series.valores2025.forEach((v,i)=>{
            geral2025[i] += v || 0;
        });

    });

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral de Perdas",
        mesesLabel,
        geral2024,
        geral2025
    );

    /* =========================
    GRÁFICOS POR LOJA
    ========================= */

    const container = document.getElementById("graficos-lojas");

    if(!container) return;

    container.innerHTML = "";

    Object.keys(lojas).forEach(lojaNome => {

        const lojaDados = lojas[lojaNome];

        const { mesesOrd, valores2024, valores2025 } =
            prepararSeries(lojaDados);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas =
            `grafico-${lojaNome.replace(/\s/g,"")}`;

        div.innerHTML = `
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(
            idCanvas,
            lojaNome,
            mesesOrd,
            valores2024,
            valores2025
        );

    });

}

montarGraficos();