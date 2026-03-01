let chartLoja=null;
let chartComparativo=null;

/* =============================
CARREGAR JSON
============================= */

async function carregarDados(){

const res=await fetch("./perdas.json");
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

/* ===== HISTÓRICO ===== */

const valores=new Array(12).fill(0);

dadosLoja.forEach(d=>{
const m=mapa[d.Mês.toLowerCase()];
if(m!==undefined){
valores[m]+=Number(d.Perdas)||0;
}
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
data:valores,
borderWidth:2
},
{
label:"Previsão IA",
data:tendencia,
borderDash:[6,6]
}
]
}
}
);

/* ===== COMPARATIVO ANUAL ===== */

const anos={};

dadosLoja.forEach(d=>{
if(!anos[d.Ano]) anos[d.Ano]=new Array(12).fill(0);

const m=mapa[d.Mês.toLowerCase()];
if(m!==undefined){
anos[d.Ano][m]+=Number(d.Perdas)||0;
}
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

}

/* =============================
KPI
============================= */

function calcularKPI(dados){

const valores=dados.map(d=>Number(d.Perdas)||0);

const total=valores.reduce((a,b)=>a+b,0);
const media=total/(valores.length||1);

document.getElementById("kpi-total")
.innerText="R$ "+total.toFixed(2);

document.getElementById("kpi-media")
.innerText="R$ "+media.toFixed(2);

}

/* =============================
INICIALIZAR
============================= */

async function iniciar(){

const dados=await carregarDados();

calcularKPI(dados);

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
analisarLoja(lojas[seletor.value]);
};

const primeira=Object.keys(lojas)[0];

if(primeira){
analisarLoja(lojas[primeira]);
}

}

window.addEventListener("DOMContentLoaded",iniciar);