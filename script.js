async function carregarDados(){
    const resposta = await fetch("perdas.json");
    return resposta.json();
}

/* KPI */

function calcularKPI(dados){

    const total = dados.reduce((a,b)=>a+(Number(b.Perdas)||0),0);
    const media = total / dados.length;

    document.getElementById("kpi-total").innerText =
        "R$ "+total.toFixed(2);

    document.getElementById("kpi-media").innerText =
        "R$ "+media.toFixed(2);

    /* alerta simples */

    const alerta = document.getElementById("kpi-alerta");

    if(media > 400){
        alerta.innerHTML = "🔴 Risco Alto";
        alerta.className="alerta";
    }
    else if(media > 200){
        alerta.innerHTML = "🟡 Risco Médio";
    }
    else{
        alerta.innerHTML = "🟢 Controlado";
    }
}

/* Ranking */

function classificarRisco(valor){
    if(valor > 4000) return "risco-alto";
    if(valor > 2000) return "risco-medio";
    return "risco-baixo";
}

function renderRanking(dados){

    const container=document.getElementById("ranking");

    const totalPorLoja={};

    dados.forEach(item=>{
        if(!totalPorLoja[item.Loja]){
            totalPorLoja[item.Loja]=0;
        }
        totalPorLoja[item.Loja]+=Number(item.Perdas)||0;
    });

    const ranking=Object.entries(totalPorLoja)
        .map(([loja,total])=>({loja,total}))
        .sort((a,b)=>b.total-a.total);

    container.innerHTML="";

    ranking.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className=
            `ranking-item ${classificarRisco(item.total)}`;

        div.innerHTML=`
        <span>🥇 ${index+1} - ${item.loja}</span>
        <span>R$ ${item.total.toFixed(2)}</span>
        `;

        container.appendChild(div);
    });
}

/* Previsão simples (Regressão Linear) */

function preverTendencia(valores){

    let xSum=0,ySum=0,xy=0,x2=0,n=valores.length;

    valores.forEach((y,x)=>{
        xSum+=x;
        ySum+=y;
        xy+=x*y;
        x2+=x*x;
    });

    const slope =
        (n*xy - xSum*ySum) /
        (n*x2 - xSum*xSum);

    const intercept =
        (ySum - slope*xSum)/n;

    return valores.map((_,x)=> slope*x + intercept);
}

/* Gráfico */

function criarGraficoTendencia(dados){

    const meses=[
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const valores=new Array(12).fill(0);

    dados.forEach(item=>{
        const mesIndex=parseInt(item.MêsNumero||0);
        if(mesIndex>=0){
            valores[mesIndex]+=Number(item.Perdas)||0;
        }
    });

    const tendencia=preverTendencia(valores);

    new Chart(
        document.getElementById("graficoTendencia"),
        {
            type:"line",
            data:{
                labels:meses,
                datasets:[
                    {
                        label:"Perdas",
                        data:valores,
                        borderWidth:2,
                        tension:.3
                    },
                    {
                        label:"Tendência",
                        data:tendencia,
                        borderWidth:2,
                        borderDash:[5,5]
                    }
                ]
            }
        }
    );
}

/* Inicialização */

async function iniciar(){

    const dados=await carregarDados();

    calcularKPI(dados);
    renderRanking(dados);
    criarGraficoTendencia(dados);

}

iniciar();