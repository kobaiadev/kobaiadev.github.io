let chartGeral=null;
let chartLoja=null;
let chartComparativo=null;

/* =============================
CARREGAR JSON
============================= */

async function carregarDados(){

try{
const res=await fetch("./perdas.json");
return await res.json();
}catch{
return [];
}

}

/* =============================
IA REGRESSÃO LINEAR
============================= */

function regressaoLinear(valores){

let xSum=0,ySum=0,xy=0,x2=0,n=valores.length;

valores.forEach((y,x)=>{
xSum+=x;
ySum+=y;
xy+=x*y;
x2+=x*x;
});

const slope=(n*xy-xSum*ySum)/((n*x2-xSum*xSum)||1);
const intercept=(ySum-slope*xSum)/(n||1);

return {
predict:(x)=>slope*x+intercept
};

}

/* =============================
KPI
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

document.getElementById("kpi-total").innerText="R$ "+total.toFixed(2);
document.getElementById("kpi-media").innerText="R$ "+media.toFixed(2);
document.getElementById("kpi-score").innerText=score.toFixed(2)+"%";

/* GRAFICO GERAL */

const modelo=regressaoLinear(valores);
const tendencia=valores.map((_,i)=>modelo.predict(i));

if(chartGeral) chartGeral.destroy();

chartGeral=new Chart(
document.getElementById("graficoGeral"),
{
type:"line",
data:{
labels:valores.map((_,i)=>i+1),
datasets:[
{
label:"Perdas",
data:valores
},
{
label:"Previsão",
data:tendencia,
borderDash:[5,5]
}
]
}
}
);

}

/* =============================
RANKING
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
ANOMALIA
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

const z=desvio===0?0:(d.Perdas-media)/desvio;

if(Math.abs(z)>2.2){

const div=document.createElement("div");
div.className="alerta";

div.innerHTML=`
🚨 Risco:
${d.Loja} | ${d.Mês}
R$ ${Number(d.Perdas).toFixed(2)}
`;

alertas.appendChild(div);

}

});

}

/* =============================
ANALISE LOJA
============================= */

function analisarLoja(nome,dadosLoja){

const meses=[
"Jan","Fev","Mar","Abr","Mai","Jun",
"Jul","Ago","Set","Out","Nov","Dez"
];

const mapa={
janeiro:0,fevereiro:1,março:2,abril:3,
maio:4,junho:5,julho:6,agosto:7,
setembro:8,outubro:9,novembro:10,dezembro:11
};

/* HISTÓRICO */

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
{label:"Histórico",data:valores},
{label:"Previsão IA",data:tendencia,borderDash:[5,5]}
]
}
}
);

/* COMPARATIVO ANUAL */

const anos={};

dadosLoja.forEach(d=>{
if(!anos[d.Ano]) anos[d.Ano]=new Array(12).fill(0);
const m=mapa[d.Mês.toLowerCase()];
if(m>=0) anos[d.Ano][m]+=Number(d.Perdas)||0;
});

const datasets=[];

Object.keys(anos).forEach(ano=>{
datasets.push({
label:ano,
data:anos[ano]
});
});

if(chartComparativo) chartComparativo.destroy();

chartComparativo=new Chart(
document.getElementById("graficoComparativo"),
{
type:"line",
data:{
labels:meses,
datasets:datasets
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

/* Agrupar lojas */

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