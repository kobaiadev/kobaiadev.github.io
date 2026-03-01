let chartLoja=null;
let chartComparativo=null;

/* =============================
CARREGAR DADOS
============================= */

async function carregarDados(){

try{
const res=await fetch("./perdas.json");
return await res.json();
}catch(e){
console.error(e);
return [];
}

}

/* =============================
MAPA DE MESES
============================= */

const meses=[
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

/* =============================
ANALISE LOJA
============================= */

function analisarLoja(dadosLoja){

/* ========= HISTÓRICO POR ANO ========= */

const anos={};

dadosLoja.forEach(d=>{

if(!anos[d.Ano]){
anos[d.Ano]=new Array(12).fill(0);
}

const mesIndex=meses.indexOf(d.Mês);

if(mesIndex>=0){
anos[d.Ano][mesIndex]+=Number(d.Perdas)||0;
}

});

/* ========= GRAFICO COMPARATIVO ANUAL ========= */

const datasets=[];

Object.keys(anos).sort().forEach(ano=>{

datasets.push({
label:"Ano "+ano,
data:anos[ano],
borderWidth:2,
tension:.35
});

});

/* Destroy anterior */
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

/* ========= PREVISÃO IA (SERIE CONTÍNUA) ========= */

const serieCompleta=[];

Object.keys(anos).sort().forEach(ano=>{
serieCompleta.push(...anos[ano]);
});

const tendencia=regressaoLinear(serieCompleta)
.map((_,i)=>regressaoLinear(serieCompleta).predict(i));

if(chartLoja) chartLoja.destroy();

chartLoja=new Chart(
document.getElementById("graficoLoja"),
{
type:"line",
data:{
labels:Array(serieCompleta.length).fill("").map((_,i)=>i+1),
datasets:[
{
label:"Histórico",
data:serieCompleta
},
{
label:"Previsão",
data:tendencia,
borderDash:[6,6]
}
]
}
}
);

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
KPI
============================= */

function calcularKPI(dados){

const valores=dados.map(d=>Number(d.Perdas)||0);

const total=valores.reduce((a,b)=>a+b,0);
const media=total/(valores.length||1);

document.getElementById("kpi-total").innerText=
"R$ "+total.toFixed(2);

document.getElementById("kpi-media").innerText=
"R$ "+media.toFixed(2);

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
.map(l=>`<option value="${l}">${l}</option>`)
.join("");

seletor.onchange=()=>{
analisarLoja(lojas[seletor.value]);
};

const primeira=Object.keys(lojas)[0];

if(primeira){
seletor.value=primeira;
analisarLoja(lojas[primeira]);
}

}

window.addEventListener("DOMContentLoaded",iniciar);