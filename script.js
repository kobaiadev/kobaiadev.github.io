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
AGRUPAR POR ANO ⭐ (CORREÇÃO PRINCIPAL)
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
GRAFICO COMPARATIVO ANUAL
============================= */

const datasets=[];

Object.keys(anos).sort().forEach(ano=>{

datasets.push({
label:"Ano "+ano,
data:anos[ano],
borderWidth:2,
tension:.3
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

const tendencia=todosValores.map((_,i)=>
modelo.predict(i)
);

/* =============================
DESTROY GRAFICOS ANTERIORES
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
data:todosValores.slice(0,12)
},
{
label:"Previsão",
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