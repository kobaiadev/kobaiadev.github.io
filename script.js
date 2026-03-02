const mesesOrd = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

async function carregarDados(){
    const resposta = await fetch("./perdas.json");
    return resposta.json();
}

function agruparPorLoja(dados){
    const lojas = {};

    dados.forEach(item=>{
        if(!lojas[item.Loja]){
            lojas[item.Loja] = [];
        }
        lojas[item.Loja].push(item);
    });

    return lojas;
}

function prepararSeries(dadosLoja){

    const valores = {
        2024:new Array(12).fill(0),
        2025:new Array(12).fill(0),
        2026:new Array(12).fill(0)
    };

    dadosLoja.forEach(item=>{
        const idx = mesesOrd.indexOf(item.Mês);

        if(idx>=0){
            if(valores[item.Ano]){
                valores[item.Ano][idx] = item.Perdas;
            }
        }
    });

    return valores;
}

function criarGrafico(id,titulo,labels,d2024,d2025,d2026){

    new Chart(document.getElementById(id),{
        type:"line",
        data:{
            labels,
            datasets:[
                {label:"2024",data:d2024,borderWidth:2,tension:0.3},
                {label:"2025",data:d2025,borderWidth:2,tension:0.3},
                {label:"2026",data:d2026,borderWidth:2,tension:0.3}
            ]
        },
        options:{
            responsive:true,
            plugins:{
                title:{
                    display:true,
                    text:titulo
                }
            }
        }
    });
}

function calcularKPI(dados){

    let total2024 = 0;
    let total2025 = 0;
    let total2026 = 0;

    dados.forEach(item=>{
        if(item.Ano === 2024) total2024 += item.Perdas;
        if(item.Ano === 2025) total2025 += item.Perdas;
        if(item.Ano === 2026) total2026 += item.Perdas;
    });

    // 🔥 CORREÇÃO DO ERRO NULL
    const el2024 = document.getElementById("kpi2024");
    const el2025 = document.getElementById("kpi2025");
    const el2026 = document.getElementById("kpi2026");

    if(el2024) el2024.innerText = "R$ " + total2024.toFixed(2);
    if(el2025) el2025.innerText = "R$ " + total2025.toFixed(2);
    if(el2026) el2026.innerText = "R$ " + total2026.toFixed(2);
}

async function iniciar(){

    const dados = await carregarDados();

    calcularKPI(dados);

    const lojas = agruparPorLoja(dados);

    /* GRAFICO GERAL */
    const total2024 = new Array(12).fill(0);
    const total2025 = new Array(12).fill(0);
    const total2026 = new Array(12).fill(0);

    dados.forEach(item=>{
        const idx = mesesOrd.indexOf(item.Mês);

        if(idx>=0){
            if(item.Ano===2024) total2024[idx]+=item.Perdas;
            if(item.Ano===2025) total2025[idx]+=item.Perdas;
            if(item.Ano===2026) total2026[idx]+=item.Perdas;
        }
    });

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral",
        Array.from({length:12},(_,i)=>i+1),
        total2024,
        total2025,
        total2026
    );

    /* GRAFICOS POR LOJA */

    const container = document.getElementById("graficos-lojas");
    container.innerHTML="";

    Object.keys(lojas).forEach(lojaNome=>{

        const serie = prepararSeries(lojas[lojaNome]);

        const div = document.createElement("div");
        div.className = "grafico-container";

        const idCanvas = "grafico-"+lojaNome.replace(/\s/g,"");

        div.innerHTML = `
            <h3>${lojaNome}</h3>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(
            idCanvas,
            lojaNome,
            mesesOrd,
            serie[2024],
            serie[2025],
            serie[2026]
        );
    });
}

/* GARANTE QUE O DOM CARREGOU */
document.addEventListener("DOMContentLoaded", iniciar);