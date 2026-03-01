
/* =============================
IA AVANÇADA
============================= */

function regressaoLinear(valores){

    let xSum=0,ySum=0,xy=0,x2=0,n=valores.length;

    valores.forEach((y,x)=>{
        xSum+=x;
        ySum+=y;
        xy+=x*y;
        x2+=x*x;
    });

    const slope=
    (n*xy-xSum*ySum)/
    ((n*x2-xSum*xSum)||1);

    const intercept=
    (ySum-slope*xSum)/(n||1);

    return {
        slope,
        intercept,
        predict:(x)=>slope*x+intercept
    };

}

/* =============================
CARREGAR DADOS
============================= */

async function carregarDados(){

    try{

        const res=await fetch("./perdas.json");

        if(!res.ok) throw new Error("Erro JSON");

        return await res.json();

    }catch(e){
        console.error(e);
        return [];
    }

}

/* =============================
KPI INTELIGENTE
============================= */

function calcularKPI(dados){

    const valores=dados.map(d=>Number(d.Perdas)||0);

    const total=valores.reduce((a,b)=>a+b,0);
    const media=total/(valores.length||1);

    const desvio=Math.sqrt(
        valores.reduce((a,b)=>a+Math.pow(b-media,2),0)
        /(valores.length||1)
    );

    const score=(desvio/(media||1))*100;

    document.getElementById("kpi-total")
    .innerText="R$ "+total.toFixed(2);

    document.getElementById("kpi-media")
    .innerText="R$ "+media.toFixed(2);

    document.getElementById("kpi-score")
    .innerText=score.toFixed(2)+"%";

    /* Previsão global */
    const modelo=regressaoLinear(valores);

    const previsao=modelo.predict(valores.length);

    document.getElementById("kpi-previsao")
    .innerText="R$ "+Math.max(previsao,0).toFixed(2);

}

/* =============================
RANKING INTELIGENTE
============================= */

function renderRanking(dados){

    const ranking={};

    dados.forEach(d=>{
        if(!ranking[d.Loja]) ranking[d.Loja]=0;
        ranking[d.Loja]+=Number(d.Perdas)||0;
    });

    const lista=Object.entries(ranking)
    .map(([loja,total])=>({loja,total}))
    .sort((a,b)=>b.total-a.total);

    const container=document.getElementById("ranking");

    container.innerHTML="";

    lista.forEach((item,i)=>{

        const div=document.createElement("div");

        div.className="ranking-item";

        div.innerHTML=
        `🥇 ${i+1} | ${item.loja}
        <span>R$ ${item.total.toFixed(2)}</span>`;

        container.appendChild(div);

    });

}

/* =============================
ANOMALIA IA
============================= */

function detectarAnomalias(dados){

    const alertas=document.getElementById("alertas");

    const valores=dados.map(d=>Number(d.Perdas)||0);

    const media=valores.reduce((a,b)=>a+b,0)/(valores.length||1);

    const desvio=Math.sqrt(
        valores.reduce((a,b)=>a+Math.pow(b-media,2),0)
        /(valores.length||1)
    );

    alertas.innerHTML="";

    dados.forEach(d=>{

        const z=
        desvio===0?0:
        (d.Perdas-media)/desvio;

        if(Math.abs(z)>2.2){

            const div=document.createElement("div");

            div.className="alerta";

            div.innerHTML=`
            🚨 Risco Detectado:
            ${d.Loja} | ${d.Mês}
            R$ ${Number(d.Perdas).toFixed(2)}
            `;

            alertas.appendChild(div);

        }

    });

}

/* =============================
LOJA ANALISE
============================= */

let chartLoja;

function analisarLoja(nome,dadosLoja){

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const mapa={
        janeiro:0,fevereiro:1,março:2,
        abril:3,maio:4,junho:5,
        julho:6,agosto:7,setembro:8,
        outubro:9,novembro:10,dezembro:11
    };

    const valores=new Array(12).fill(0);

    dadosLoja.forEach(d=>{
        const m=mapa[d.Mês.toLowerCase()];
        if(m>=0) valores[m]+=Number(d.Perdas)||0;
    });

    const modelo=regressaoLinear(valores);

    const tendencia=valores.map((_,i)=>modelo.predict(i));

    if(chartLoja) chartLoja.destroy();

    chartLoja=new Chart(
        document.getElementById("graficoLoja"),
        {
            type:"line",
            data:{
                labels:meses,
                datasets:[
                    {
                        label:"Histórico",
                        data:valores
                    },
                    {
                        label:"Previsão IA",
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
INICIALIZAR
============================= */

async function iniciar(){

    const dados=await carregarDados();

    if(!dados.length) return;

    calcularKPI(dados);
    renderRanking(dados);

    const lojas={};

    dados.forEach(d=>{
        if(!lojas[d.Loja]) lojas[d.Loja]=[];
        lojas[d.Loja].push(d);
    });

    const seletor=document.getElementById("seletorLoja");

    seletor.innerHTML=
    Object.keys(lojas)
    .map(l=>`<option>${l}</option>`)
    .join("");

    seletor.onchange=()=>{
        analisarLoja(seletor.value,lojas[seletor.value]);
    };

    const primeira=Object.keys(lojas)[0];

    if(primeira)
        analisarLoja(primeira,lojas[primeira]);

}

window.addEventListener("DOMContentLoaded",iniciar);