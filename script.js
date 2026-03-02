let chartGeral=null;

/* =============================
CARREGAR DADOS
============================= */

async function carregarDados(){
    const resposta = await fetch("/perdas.json");
    return resposta.json();
}

/* =============================
AGRUPAR POR LOJA
============================= */

function agruparPorLoja(dados){

    const lojas={};

    dados.forEach(item=>{
        if(!lojas[item.Loja]){
            lojas[item.Loja]=[];
        }
        lojas[item.Loja].push(item);
    });

    return lojas;
}

/* =============================
CRIAR GRAFICO PADRÃO
============================= */

function criarGrafico(idCanvas,titulo,labels,valores2024,valores2025){

new Chart(
document.getElementById(idCanvas),
{
type:"line",
data:{
labels,
datasets:[
{
label:"2024",
data:valores2024,
borderWidth:2,
tension:.3
},
{
label:"2025",
data:valores2025,
borderWidth:2,
tension:.3
}
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
}
);

}

/* =============================
PREPARAR SERIES
============================= */

function prepararSeries(dadosLoja){

const mesesOrd=[
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const valores2024=new Array(12).fill(null);
const valores2025=new Array(12).fill(null);

dadosLoja.forEach(item=>{

const idx=mesesOrd.indexOf(item.Mês);

if(idx>=0){

if(item.Ano===2024){
valores2024[idx]=Number(item.Perdas)||0;
}

if(item.Ano===2025){
valores2025[idx]=Number(item.Perdas)||0;
}

}

});

return {mesesOrd,valores2024,valores2025};

}

/* =============================
MONTA DASHBOARD
============================= */

async function montarGraficos(){

const dados=await carregarDados();

if(!dados.length) return;

const lojas=agruparPorLoja(dados);

/* =============================
KPI CORPORATIVO
============================= */

const total=dados.reduce((a,b)=>a+(Number(b.Perdas)||0),0);

document.getElementById("kpi-total").innerText=
"R$ "+total.toFixed(2);

/* =============================
GRÁFICO GERAL
============================= */

const todas2024=new Array(12).fill(0);
const todas2025=new Array(12).fill(0);

Object.values(lojas).forEach(loja=>{

const series=prepararSeries(loja);

series.valores2024.forEach((v,i)=>{
todas2024[i]+=v||0;
});

series.valores2025.forEach((v,i)=>{
todas2025[i]+=v||0;
});

});

/* Destroy anterior */

if(chartGeral) chartGeral.destroy();

chartGeral=new Chart(
document.getElementById("graficoGeral"),
{
type:"line",
data:{
labels:[
"Jan","Fev","Mar","Abr","Mai","Jun",
"Jul","Ago","Set","Out","Nov","Dez"
],
datasets:[
{
label:"2024",
data:todas2024,
borderWidth:2
},
{
label:"2025",
data:todas2025,
borderWidth:2
}
]
}
}
);

/* =============================
GRÁFICOS POR LOJA
============================= */

const container=document.getElementById("graficos-lojas");

if(container){
container.innerHTML="";

Object.keys(lojas).forEach(lojaNome=>{

const lojaDados=lojas[lojaNome];
const series=prepararSeries(lojaDados);

const div=document.createElement("div");
div.className="grafico-container";

const idCanvas=
"grafico_"+lojaNome.replace(/\s/g,"");

div.innerHTML=
`<h3>${lojaNome}</h3>
<canvas id="${idCanvas}"></canvas>`;

container.appendChild(div);

criarGrafico(
idCanvas,
lojaNome,
series.mesesOrd,
series.valores2024,
series.valores2025
);

});

}

}

/* =============================
INICIAR
============================= */

window.addEventListener("DOMContentLoaded",montarGraficos);