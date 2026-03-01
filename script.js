/* =============================
CARREGAR DADOS
============================= */

async function carregarDados(){

    try{

        const resposta = await fetch("./perdas.json");

        if(!resposta.ok){
            throw new Error("Erro ao carregar JSON");
        }

        return await resposta.json();

    }catch(e){
        console.error(e);
        return [];
    }
}

/* =============================
KPI
============================= */

function calcularKPI(dados){

    if(!dados.length) return;

    const valores = dados.map(d=>Number(d.Perdas)||0);

    const total = valores.reduce((a,b)=>a+b,0);

    const media = total/(valores.length||1);

    document.getElementById("kpi-total")
        .innerText="R$ "+total.toFixed(2);

    document.getElementById("kpi-media")
        .innerText="R$ "+media.toFixed(2);

    const status=document.getElementById("kpi-status");

    if(media>400){
        status.innerHTML="🔴 Risco Alto";
    }
    else if(media>200){
        status.innerHTML="🟡 Risco Médio";
    }
    else{
        status.innerHTML="🟢 Controlado";
    }

}

/* =============================
PREVISÃO (Suavização Exponencial)
============================= */

function suavizacaoExponencial(valores, alpha=0.3){

    let resultado=[valores[0]];

    for(let i=1;i<valores.length;i++){
        resultado.push(
            alpha*valores[i] +
            (1-alpha)*resultado[i-1]
        );
    }

    return resultado;
}

/* =============================
RANKING
============================= */

function classificarRiscoPercentil(valor, lista){

    const sorted=[...lista].sort((a,b)=>a-b);

    const p90 = sorted[Math.floor(sorted.length*0.9)];
    const p75 = sorted[Math.floor(sorted.length*0.75)];

    if(valor>=p90) return "risco-alto";
    if(valor>=p75) return "risco-medio";

    return "risco-baixo";
}

function renderRanking(dados){

    const ranking={};

    dados.forEach(item=>{
        if(!ranking[item.Loja]) ranking[item.Loja]=0;
        ranking[item.Loja]+=Number(item.Perdas)||0;
    });

    const lista = Object.entries(ranking)
        .map(([loja,total])=>({loja,total}))
        .sort((a,b)=>b.total-a.total);

    const valores = dados.map(d=>Number(d.Perdas)||0);

    const container=document.getElementById("ranking");

    container.innerHTML="";

    lista.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className=
        `ranking-item ${classificarRiscoPercentil(item.total,valores)}`;

        div.innerHTML=`
        🥇 ${index+1} - ${item.loja}
        <span>R$ ${item.total.toFixed(2)}</span>
        `;

        container.appendChild(div);

    });

}

/* =============================
ANOMALIA
============================= */

function detectarAnomalias(dados){

    const alertas=document.getElementById("alertasLoja");
    if(!alertas) return;

    const valores=dados.map(d=>Number(d.Perdas)||0);

    const media =
        valores.reduce((a,b)=>a+b,0)/(valores.length||1);

    const desvio=Math.sqrt(
        valores.reduce((a,b)=>a+Math.pow(b-media,2),0)
        /(valores.length||1)
    );

    alertas.innerHTML="";

    dados.forEach(item=>{

        const zScore =
            desvio === 0 ? 0 :
            (Number(item.Perdas)-media)/desvio;

        if(Math.abs(zScore)>2.5){

            const div=document.createElement("div");

            div.className="alerta-critico";

            div.innerHTML=`
            🚨 Anomalia:
            ${item.Loja} |
            ${item.Mês}
            R$ ${Number(item.Perdas).toFixed(2)}
            `;

            alertas.appendChild(div);
        }

    });

}

/* =============================
GRAFICO LOJA
============================= */

let graficoLojaAtual=null;

function analisarLoja(nome,dadosLoja){

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const mapaMes = {
        janeiro:0, fevereiro:1, março:2,
        abril:3, maio:4, junho:5,
        julho:6, agosto:7, setembro:8,
        outubro:9, novembro:10, dezembro:11
    };

    const valores=new Array(12).fill(0);

    dadosLoja.forEach(item=>{

        const mesIndex =
            mapaMes[item.Mês.toLowerCase()];

        if(mesIndex>=0){
            valores[mesIndex]+=Number(item.Perdas)||0;
        }

    });

    const tendencia = suavizacaoExponencial(valores);

    if(graficoLojaAtual) graficoLojaAtual.destroy();

    graficoLojaAtual=new Chart(
        document.getElementById("graficoLoja"),
        {
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
                        label:"Tendência",
                        data:tendencia,
                        borderDash:[5,5]
                    }
                ]
            }
        }
    );

    detectarAnomalias(dadosLoja);

}

/* =============================
SELETOR
============================= */

function preencherSeletor(lojas){

    const seletor=document.getElementById("seletorLoja");

    seletor.innerHTML=
    Object.keys(lojas)
    .map(l=>`<option value="${l}">${l}</option>`)
    .join("");

    seletor.onchange=()=>{

        analisarLoja(
            seletor.value,
            lojas[seletor.value]
        );

    };

}

/* =============================
INICIALIZAR
============================= */

async function iniciar(){

    const dados = await carregarDados();

    if(!dados.length) return;

    calcularKPI(dados);
    renderRanking(dados);

    const lojas={};

    dados.forEach(item=>{
        if(!lojas[item.Loja]) lojas[item.Loja]=[];
        lojas[item.Loja].push(item);
    });

    preencherSeletor(lojas);

    const primeira = Object.keys(lojas)[0];

    if(primeira){
        analisarLoja(primeira,lojas[primeira]);
    }

}

window.addEventListener("DOMContentLoaded",iniciar);