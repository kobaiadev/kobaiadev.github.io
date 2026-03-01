let dadosGlobais = [];
let dadosAgrupados = {};

async function carregarDados() {
    const resposta = await fetch("perdas.json");
    const dados = await resposta.json();
    dadosGlobais = dados;
    return dados;
}

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

function preencherFiltroAnos() {
    const select = document.getElementById("filtroAno");
    const anos = [...new Set(dadosGlobais.map(d => d.Ano))].sort();

    select.innerHTML = "<option value=''>Selecione</option>";

    anos.forEach(ano => {
        select.innerHTML += `<option value="${ano}">${ano}</option>`;
    });

    select.addEventListener("change", () => {
        gerarGraficoRanking(select.value);
    });
}

function gerarGraficoRanking(anoFiltro) {

    const ranking = [];

    Object.keys(dadosAgrupados).forEach(loja => {

        const anos = Object.keys(dadosAgrupados[loja]).sort();
        const ultimoAno = anos[anos.length - 1];
        const anoAnterior = anos[anos.length - 2];

        const valorAtual = anoFiltro ? 
            (dadosAgrupados[loja][anoFiltro] || 0) :
            (dadosAgrupados[loja][ultimoAno] || 0);

        let variacao = 0;

        if (anoAnterior && dadosAgrupados[loja][anoAnterior]) {
            variacao = ((valorAtual - dadosAgrupados[loja][anoAnterior]) / dadosAgrupados[loja][anoAnterior]) * 100;
        }

        ranking.push({
            loja,
            valor: valorAtual,
            variacao: variacao
        });
    });

    ranking.sort((a,b) => b.valor - a.valor);

    const labels = ranking.map(r => {
        const seta = r.variacao > 0 ? "🔴" : "🟢";
        return `${r.loja} (${r.variacao.toFixed(1)}% ${seta})`;
    });

    const valores = ranking.map(r => r.valor);

    const ctx = document.getElementById("graficoRanking");

    if (window.graficoRankingInstance) {
        window.graficoRankingInstance.destroy();
    }

    window.graficoRankingInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Perdas",
                data: valores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function limparFiltro() {
    document.getElementById("filtroAno").value = "";
    gerarGraficoRanking("");
}

function gerarGraficoGeral() {

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
        }
    });
}

carregarDados().then(dados => {
    dadosAgrupados = agruparPorLojaEAno(dados);
    preencherFiltroAnos();
    gerarGraficoGeral();
    gerarGraficoRanking("");
});