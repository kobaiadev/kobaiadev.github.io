let chartLoja=null;
let chartComparativo=null;

/* =============================
CARREGAR JSON
============================= */

async function carregarDados(){

try{

const res=await fetch("./perdas.json");

if(!res.ok) throw new Error("Erro ao carregar JSON");

return await res.json();

}catch(e){
console.error(e);
return [];
}

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
ANALISE LOJA ⭐ CORRIGIDO
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

/* =============================
AGRUPAR POR ANO (CORRETO AGORA ⭐)
============================= */

const anos={};

dadosLoja.forEach(d=>{

if(!anos[d.Ano]){
anos[d.Ano]=new Array(12).fill(0);
}

const mesIndex=mapa[d.Mês.toLowerCase()];

if(mesIndex!==undefined){
anos[d.Ano][mesIndex]+=Number(d.Perdas)||0;
}

});

/* =============================
PREPARAR DATASETS
============================= */

const datasets=[];

Object.keys(anos).sort().forEach(ano=>{
datasets.push({
label:"Ano "+ano,
data:anos[ano],
borderWidth:2,
tension:.35
});
});

/* =============================
PREVISÃO IA (BASE GLOBAL)
============================= */

const todosValores=[];

Object.values(anos).forEach(arr=>{
todosValores.push(...arr);
});

const modelo=regressaoLinear(todosValores);
const tendencia=todosValores.map((_,i)=>modelo.predict(i));

/* =============================
DESTROY GRAFICOS
============================= */

if(chartLoja) chartLoja.destroy();
if(chartComparativo) chartComparativo.destroy();

/* =============================
GRAFICO HISTÓRICO + PREVISÃO
============================= */

chartLoja=new Chart(
document.getElementById("graficoLoja"),
{
type:"line",
data:{
labels:meses,
datasets:[
{
label:"Histórico",
data:todosValores.slice(0,12),
borderWidth:2
},
{
label:"Previsão IA",
data:tendencia.slice(0,12),
borderDash:[6,6]
}
]
}
}
);

/* =============================
COMPARATIVO ANUAL REAL ⭐
============================= */

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

const kpiTotal=document.getElementById("kpi-total");
const kpiMedia=document.getElementById("kpi-media");

if(kpiTotal) kpiTotal.innerText="R$ "+total.toFixed(2);
if(kpiMedia) kpiMedia.innerText="R$ "+media.toFixed(2);

}

/* =============================
INICIALIZAR
============================= */

async function iniciar(){

const dados=await carregarDados();

if(!dados.length) return;

calcularKPI(dados);

/* Agrupar lojas */

const lojas={};

dados.forEach(d=>{
if(!lojas[d.Loja]) lojas[d.Loja]=[];
lojas[d.Loja].push(d);
});

const seletor=document.getElementById("seletorLoja");

if(!seletor) return;

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