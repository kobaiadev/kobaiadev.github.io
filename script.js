async function carregarDados() {
    const resposta = await fetch("perdas.json");
    return await resposta.json();
}

function agruparPorLojaEAno(dados) {
    const resultado = {};

    dados.forEach(item => {
        const loja = item.loja;
        const ano = item.ano;
        const valor = Number(item.valor) || 0;

        if (!resultado[loja]) resultado[loja] = {};
        if (!resultado[loja][ano]) resultado[loja][ano] = 0;

        resultado[loja][ano] += valor;
    });

    return resultado;
}

function gerarGraficoGeral(dadosAgrupados) {
    const lojas = Object.keys(dadosAgrupados).sort((a,b)=>a-b);
    const anos = [...new Set(
        Object.values(dadosAgrupados)
        .flatMap(loja => Object.keys(loja))
    )].sort();

    const datasets = anos.map(ano => {
        return {
            label: ano,
            data: lojas.map(loja => dadosAgrupados[loja][ano] || 0),
            borderWidth: 2
        };
    });

    new Chart(document.getElementById("graficoGeral"), {
        type: "bar",
        data: {
            labels: lojas,
            datasets: datasets
        }
    });
}

function gerarGraficosPorLoja(dadosAgrupados, dadosOriginais) {
    const container = document.getElementById("graficos-lojas");
    container.innerHTML = "";

    Object.keys(dadosAgrupados)
        .sort((a,b)=>a-b)
        .forEach(loja => {

        const div = document.createElement("div");
        div.className = "grafico-container";

        div.innerHTML = `
            <h2>Loja ${loja}</h2>
            <canvas id="grafico-loja-${loja}" height="200"></canvas>
            <button onclick="abrirModal(${loja})">Ver Dados</button>
        `;

        container.appendChild(div);

        const anos = Object.keys(dadosAgrupados[loja]).sort();
        const valores = anos.map(ano => dadosAgrupados[loja][ano]);

        new Chart(
            document.getElementById(`grafico-loja-${loja}`),
            {
                type: "line",
                data: {
                    labels: anos,
                    datasets: [{
                        label: `Loja ${loja}`,
                        data: valores,
                        borderWidth: 2,
                        tension: 0.2
                    }]
                }
            }
        );
    });
}

function abrirModal(loja) {
    const modal = document.getElementById("modal-dados");
    const titulo = document.getElementById("modal-titulo");
    const jsonBox = document.getElementById("modal-json");

    titulo.innerText = `Dados da Loja ${loja}`;

    carregarDados().then(dados => {
        const dadosLoja = dados.filter(d => d.loja == loja);
        jsonBox.innerText = JSON.stringify(dadosLoja, null, 2);
    });

    modal.classList.add("open");
}

document.getElementById("btn-fechar").addEventListener("click", () => {
    document.getElementById("modal-dados").classList.remove("open");
});

carregarDados().then(dados => {
    const agrupado = agruparPorLojaEAno(dados);
    gerarGraficoGeral(agrupado);
    gerarGraficosPorLoja(agrupado, dados);
});