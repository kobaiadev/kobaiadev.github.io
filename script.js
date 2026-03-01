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

    const total = dados.reduce(
        (a,b)=>a+(Number(b.Perdas)||0),0
    );

    const media = total/(dados.length||1);

    document.getElementById("kpi-total")
        .innerText="R$ "+total.toFixed(2);

    document.getElementById("kpi-media")
        .innerText="R$ "+media.toFixed(2);

    const status=document.getElementById("kpi-status");

    if(media>400){
        status.innerHTML="🔴 Risco Alto";
        status.className="alerta-critico";
    }
    else if(media>200){
        status.innerHTML="🟡 Risco Médio";
    }
    else{
        status.innerHTML="🟢 Controlado";
    }

}

/* =============================
RANKING
============================= */

function classificarRisco(valor){
    if(valor>4000) return "risco-alto";
    if(valor>2000) return "risco-medio";
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

    const container=document.getElementById("ranking");

    container.innerHTML="";

    lista.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className=
        `ranking-item ${classificarRisco(item.total)}`;

        div.innerHTML=`
        🥇 ${index+1} - ${item.loja}
        <span>R$ ${item.total.toFixed(2)}</span>
        `;

        container.appendChild(div);

    });

}

/* =============================
IA ANOMALIA
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

    const limite = media + (2*desvio);

    alertas.innerHTML="";

    dados.forEach(item=>{
        if(item.Perdas > limite){

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
PREDIÇÃO
============================= */

function preverTendencia(valores){

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

    return valores.map((_,x)=> slope*x + intercept);
}

/* =============================
GRÁFICO INDIVIDUAL
============================= */

let graficoLojaAtual=null;

function analisarLoja(nome, dadosLoja){

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const valores=new Array(12).fill(0);

    dadosLoja.forEach(item=>{
        const mesIndex=
            meses.indexOf(item.Mês.substring(0,3));

        if(mesIndex>=0){
            valores[mesIndex]+=Number(item.Perdas)||0;
        }
    });

    const tendencia=preverTendencia(valores);

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
                        label:"Predição",
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
SELETOR LOJA
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

    /* Agrupar por loja */

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