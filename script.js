/* =========================
CARREGAR DADOS
========================= */

async function carregarDados(){

    try{
        const resposta = await fetch("./perdas.json");

        if(!resposta.ok){
            throw new Error("Arquivo perdas.json não encontrado");
        }

        return await resposta.json();

    }catch(error){
        console.error(error);
        alert("Erro ao carregar dados.");
        return [];
    }
}

/* =========================
KPI
========================= */

function calcularKPI(dados){

    if(!dados || dados.length === 0) return;

    const total = dados.reduce((a,b)=>a+(Number(b.Perdas)||0),0);
    const media = total / (dados.length || 1);

    const elTotal = document.getElementById("kpi-total");
    const elMedia = document.getElementById("kpi-media");
    const elStatus = document.getElementById("kpi-status");

    if(elTotal) elTotal.innerText = "R$ "+total.toFixed(2);
    if(elMedia) elMedia.innerText = "R$ "+media.toFixed(2);

    if(elStatus){

        if(media > 400){
            elStatus.innerHTML="🔴 Risco Alto";
            elStatus.className="alerta-critico";
        }
        else if(media > 200){
            elStatus.innerHTML="🟡 Risco Médio";
        }
        else{
            elStatus.innerHTML="🟢 Controlado";
        }

    }
}

/* =========================
RANKING
========================= */

function classificarRisco(valor){
    if(valor > 4000) return "risco-alto";
    if(valor > 2000) return "risco-medio";
    return "risco-baixo";
}

function renderRanking(dados){

    const container = document.getElementById("ranking");
    if(!container) return;

    const ranking = {};

    dados.forEach(item=>{
        if(!ranking[item.Loja]) ranking[item.Loja]=0;
        ranking[item.Loja]+=Number(item.Perdas)||0;
    });

    const lista = Object.entries(ranking)
        .map(([loja,total])=>({loja,total}))
        .sort((a,b)=>b.total-a.total);

    container.innerHTML="";

    lista.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className =
            `ranking-item ${classificarRisco(item.total)}`;

        div.innerHTML=`
            🥇 ${index+1} - ${item.loja}
            <span>R$ ${item.total.toFixed(2)}</span>
        `;

        container.appendChild(div);

    });
}

/* =========================
ANOMALIAS (IA ESTATÍSTICA SIMPLES)
========================= */

function detectarAnomalias(dados){

    const alertas=document.getElementById("alertas");
    if(!alertas) return;

    const valores=dados.map(d=>Number(d.Perdas)||0);

    const media=valores.reduce((a,b)=>a+b,0)/(valores.length||1);

    const desvio=Math.sqrt(
        valores.reduce((a,b)=>a+Math.pow(b-media,2),0)
        /(valores.length||1)
    );

    const limiteSuperior = media + (2*desvio);

    alertas.innerHTML="";

    dados.forEach(item=>{
        if(item.Perdas > limiteSuperior){

            const div=document.createElement("div");
            div.className="alerta-critico";

            div.innerHTML=`
            🚨 Anomalia:
            ${item.Loja} | ${item.Mês}
            R$ ${Number(item.Perdas).toFixed(2)}
            `;

            alertas.appendChild(div);
        }
    });
}

/* =========================
PREDIÇÃO LINEAR
========================= */

function preverTendencia(valores){

    if(!valores || valores.length === 0)
        return valores;

    let xSum=0,ySum=0,xy=0,x2=0,n=valores.length;

    valores.forEach((y,x)=>{
        xSum+=x;
        ySum+=y;
        xy+=x*y;
        x2+=x*x;
    });

    const slope =
        (n*xy - xSum*ySum) /
        ((n*x2 - xSum*xSum) || 1);

    const intercept =
        (ySum - slope*xSum)/(n||1);

    return valores.map((_,x)=> slope*x + intercept);
}

/* =========================
GRAFICO
========================= */

let graficoAtual = null;

function criarGrafico(dados){

    const canvas = document.getElementById("graficoPredicao");
    if(!canvas) return;

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const valores=new Array(12).fill(0);

    dados.forEach(item=>{
        const mesIndex = meses.indexOf(
            item.Mês.substring(0,3)
        );

        if(mesIndex>=0){
            valores[mesIndex]+=Number(item.Perdas)||0;
        }
    });

    const tendencia = preverTendencia(valores);

    if(graficoAtual){
        graficoAtual.destroy();
    }

    graficoAtual = new Chart(canvas,{
        type:"line",
        data:{
            labels:meses,
            datasets:[
                {
                    label:"Histórico",
                    data:valores,
                    borderWidth:2,
                    tension:.35
                },
                {
                    label:"Predição",
                    data:tendencia,
                    borderDash:[5,5],
                    borderWidth:2
                }
            ]
        }
    });

}

/* =========================
INICIALIZAR
========================= */

window.addEventListener("DOMContentLoaded", async ()=>{

    const dados = await carregarDados();

    calcularKPI(dados);
    renderRanking(dados);
    detectarAnomalias(dados);
    criarGrafico(dados);

});