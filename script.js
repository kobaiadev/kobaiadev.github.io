async function carregarDados() {
    const resposta = await fetch("perdas.json");
    const dados = await resposta.json();
    return dados;
}

function agruparPorAno(dados) {
    const anos = {};

    dados.forEach(item => {
        const ano = String(item.ano); // garante string
        const valor = Number(item.valor) || 0;

        if (!anos[ano]) {
            anos[ano] = 0;
        }

        anos[ano] += valor;
    });

    return anos;
}

function agruparPorLoja(dados) {
    const lojas = {};

    dados.forEach(item => {
        const loja = String(item.loja);
        const valor = Number(item.valor) || 0;

        if (!lojas[loja]) {
            lojas[loja] = 0;
        }

        lojas[loja] += valor;
    });

    return lojas;
}

function agruparAnoPorLoja(dados) {
    const resultado = {};

    dados.forEach(item => {
        const ano = String(item.ano);
        const loja = String(item.loja);
        const valor = Number(item.valor) || 0;

        if (!resultado[ano]) {
            resultado[ano] = {};
        }

        if (!resultado[ano][loja]) {
            resultado[ano][loja] = 0;
        }

        resultado[ano][loja] += valor;
    });

    return resultado;
}

function gerarGraficoAnual(dados) {
    const anosAgrupados = agruparPorAno(dados);

    const labels = Object.keys(anosAgrupados).sort();
    const valores = labels.map(ano => anosAgrupados[ano]);

    new Chart(document.getElementById("graficoAnual"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Perdas por Ano",
                data: valores,
                borderWidth: 1
            }]
        }
    });
}

function gerarGraficoPorLoja(dados) {
    const lojasAgrupadas = agruparPorLoja(dados);

    const labels = Object.keys(lojasAgrupadas).sort((a,b) => Number(a)-Number(b));
    const valores = labels.map(loja => lojasAgrupadas[loja]);

    new Chart(document.getElementById("graficoLoja"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Perdas por Loja",
                data: valores,
                borderWidth: 1
            }]
        }
    });
}

function gerarGraficoComparativo(dados) {
    const dadosAnoLoja = agruparAnoPorLoja(dados);

    const anos = Object.keys(dadosAnoLoja).sort();
    
    // pega todas as lojas existentes
    const todasLojas = new Set();
    anos.forEach(ano => {
        Object.keys(dadosAnoLoja[ano]).forEach(loja => {
            todasLojas.add(loja);
        });
    });

    const lojas = Array.from(todasLojas).sort((a,b) => Number(a)-Number(b));

    const datasets = anos.map(ano => {
        return {
            label: ano,
            data: lojas.map(loja => dadosAnoLoja[ano][loja] || 0),
            fill: false,
            tension: 0.1
        };
    });

    new Chart(document.getElementById("graficoComparativo"), {
        type: "line",
        data: {
            labels: lojas,
            datasets: datasets
        }
    });
}

carregarDados().then(dados => {
    gerarGraficoAnual(dados);
    gerarGraficoPorLoja(dados);
    gerarGraficoComparativo(dados);
});