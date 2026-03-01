async function carregarDados(){
    const resposta=await fetch("perdas.json");
    return resposta.json();
}

/* KPI */

function calcularKPI(dados){

    const total=dados.reduce((a,b)=>a+(Number(b.Perdas)||0),0);
    const media=total/dados.length;

    document.getElementById("kpi-total").innerText=
        "R$ "+total.toFixed(2);

    document.getElementById("kpi-media").innerText=
        "R$ "+media.toFixed(2);

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

/* Ranking */

function renderRanking(dados){

    const ranking={};

    dados.forEach(item=>{
        if(!ranking[item.Loja]){
            ranking[item.Loja]=0;
        }
        ranking[item.Loja]+=Number(item.Perdas)||0;
    });

    const lista=Object.entries(ranking)
        .map(([loja,total])=>({loja,total}))
        .sort((a,b)=>b.total-a.total);

    const container=document.getElementById("ranking");
    container.innerHTML="";

    lista.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className=
            `ranking-item ${classificarRisco(item.total)}`;

        div.innerHTML=
        `🥇 ${index+1} - ${item.loja}
         <span>R$ ${item.total.toFixed(2)}</span>`;

        container.appendChild(div);

    });
}

function classificarRisco(valor){
    if(valor>4000) return "risco-alto";
    if(valor>2000) return "risco-medio";
    return "risco-baixo";
}

/* Detecção de Anomalias (IA Simples Estatística) */

function detectarAnomalias(dados){

    const valores=dados.map(d=>Number(d.Perdas)||0);

    const media=valores.reduce((a,b)=>a+b)/valores.length;

    const desvio=Math.sqrt(
        valores.reduce((a,b)=>a+Math.pow(b-media,2),0)
        /valores.length
    );

    const limiteSuperior=media + (2*desvio);

    const alertas=document.getElementById("alertas");
    alertas.innerHTML="";

    dados.forEach(item=>{
        if(item.Perdas > limiteSuperior){

            const div=document.createElement("div");

            div.className="alerta-critico";

            div.innerHTML=
            `🚨 Anomalia detectada:
            ${item.Loja} | ${item.Mês}
            R$ ${item.Perdas}`;

            alertas.appendChild(div);
        }
    });
}

/* Predição (Regressão Linear) */

function preverTendencia(valores){

    let xSum=0,ySum=0,xy=0,x2=0,n=valores.length;

    valores.forEach((y,x)=>{
        xSum+=x;
        ySum+=y;
        xy+=x*y;
        x2+=x*x;
    });

    const slope=(n*xy-xSum*ySum)/(n*x2-xSum*xSum);
    const intercept=(ySum-slope*xSum)/n;

    return valores.map((_,x)=> slope*x + intercept);
}

/* Gráfico */

function criarGrafico(dados){

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const valores=new Array(12).fill(0);

    dados.forEach(item=>{
        const mesIndex=meses.indexOf(item.Mês.substring(0,3));
        if(mesIndex>=0){
            valores[mesIndex]+=Number(item.Perdas)||0;
        }
    });

    const tendencia=preverTendencia(valores);

    new Chart(
        document.getElementById("graficoPredicao"),
        {
            type:"line",
            data:{
                labels:meses,
                datasets:[
                    {
                        label:"Histórico",
                        data:valores,
                        borderWidth:2,
                        tension:.3
                    },
                    {
                        label:"Predição",
                        data:tendencia,
                        borderDash:[5,5],
                        borderWidth:2
                    }
                ]
            }
        }
    );
}

/* Inicializar */

async function iniciar(){

    const dados=await carregarDados();

    calcularKPI(dados);
    renderRanking(dados);
    detectarAnomalias(dados);
    criarGrafico(dados);

}

iniciar();