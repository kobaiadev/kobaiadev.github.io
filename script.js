
let chartGeral=null;
let chartLoja=null;
let chartComparativo=null;

/* =============================
CARREGAR JSON
============================= */

async function carregarDados(){

const res=await fetch("/perdas.json");
return await res.json();

}

/* =============================
REGRESSÃO LINEAR
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
ANALYTICS KPI
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
{label:"Perdas",data:valores},
{label:"Previsão",data:tendencia,borderDash:[6,6]}
]
}
}
);

}

/* =============================
ANALISE LOJA
============================= */

function analisarLoja(dadosLoja){

const meses=[
"Jan","Fev","Mar","Abr","Mai","Jun",
"Jul","Ago","Set","Out","Nov","Dez"
];

const mapa={
janeiro:0,fevereiro:1,março:2,abril:3,
maio:4,junho:5,julho:6,agosto:7,
setembro:8,outubro:9,novembro:10,dezembro:11
};

const anos={};

dadosLoja.forEach(d=>{

if(!anos[d.Ano]) anos[d.Ano]=new Array(12).fill(0);

const m=mapa[d.Mês.toLowerCase()];
if(m!==undefined){
anos[d.Ano][m]+=Number(d.Perdas)||0;
}

});

/* datasets */
const datasets=[];

Object.keys(anos).sort().forEach(a=>{
datasets.push({
label:"Ano "+a,
data:anos[a],
borderWidth:2
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

/* série contínua */

const serie=[];
Object.values(anos).forEach(arr=>{
serie.push(...arr);
});

const modelo=regressaoLinear(serie);
const tendencia=serie.map((_,i)=>modelo.predict(i));

if(chartLoja) chartLoja.destroy();

chartLoja=new Chart(
document.getElementById("graficoLoja"),
{
type:"line",
data:{
labels:serie.map((_,i)=>i+1),
datasets:[
{label:"Histórico",data:serie},
{label:"Previsão",data:tendencia,borderDash:[6,6]}
]
}
}
);

}

/* =============================
RANKING RISCO
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

lista.forEach((i,idx)=>{

const div=document.createElement("div");

div.className="ranking-item";

div.innerHTML=
`🥇 ${idx+1} ${i.loja}
<span>R$ ${i.total.toFixed(2)}</span>`;

container.appendChild(div);

});

}

/* =============================
INIT
============================= */

async function iniciar(){

const dados=await carregarDados();

if(!dados.length) return;

calcularKPI(dados);
renderRanking(dados);

/* lojas */

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
analisarLoja(lojas[seletor.value]);
};

const primeira=Object.keys(lojas)[0];

if(primeira)
analisarLoja(lojas[primeira]);

}

window.addEventListener("DOMContentLoaded",iniciar);