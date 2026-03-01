async function carregarDados(){
    const resposta = await fetch("perdas.json");
    return resposta.json();
}

function agruparPorLoja(dados){

    const lojas = {};

    dados.forEach(item=>{
        if(!lojas[item.Loja]){
            lojas[item.Loja]=[];
        }
        lojas[item.Loja].push(item);
    });

    return lojas;
}

function classificarRisco(valor){
    if(valor > 4000) return "risco-alto";
    if(valor > 2000) return "risco-medio";
    return "risco-baixo";
}

function calcularRanking(dados){

    const totalPorLoja = {};

    dados.forEach(item=>{
        if(!totalPorLoja[item.Loja]){
            totalPorLoja[item.Loja]=0;
        }
        totalPorLoja[item.Loja]+=Number(item.Perdas)||0;
    });

    const ranking = Object.keys(totalPorLoja).map(loja=>({
        loja,
        total: totalPorLoja[loja]
    }));

    return ranking.sort((a,b)=>b.total-a.total);
}

function renderRanking(ranking){

    const container = document.getElementById("ranking");
    container.innerHTML="";

    ranking.forEach((item,index)=>{

        const div=document.createElement("div");

        div.className=`ranking-item ${classificarRisco(item.total)}`;

        div.innerHTML=`
            <span>🥇 ${index+1} - ${item.loja}</span>
            <span>R$ ${item.total.toFixed(2)}</span>
        `;

        container.appendChild(div);
    });
}

function abrirModal(titulo, dados){

    document.getElementById("modal-titulo").textContent=titulo;
    document.getElementById("modal-json").textContent=
        JSON.stringify(dados,null,2);

    document.getElementById("modal-dados").classList.add("open");
}

document.getElementById("btn-fechar").onclick=()=>{
    document.getElementById("modal-dados").classList.remove("open");
}

function criarGrafico(idCanvas,titulo,labels,datasets){

    const canvas=document.getElementById(idCanvas);

    const antigo=Chart.getChart(canvas);
    if(antigo) antigo.destroy();

    new Chart(canvas,{
        type:"line",
        data:{ labels,datasets },
        options:{
            responsive:true,
            plugins:{
                title:{display:true,text:titulo}
            },
            onClick:(evt,elements)=>{
                if(elements.length){
                    const index=elements[0].index;
                    abrirModal(titulo,{
                        mes:labels[index],
                        dados:datasets
                    });
                }
            }
        }
    });
}

function prepararSeries(dadosLoja){

    const mesesOrd=[
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const anos=[...new Set(dadosLoja.map(d=>d.Ano))].sort((a,b)=>a-b);

    const datasets=anos.map(ano=>{

        const valores=new Array(12).fill(0);

        mesesOrd.forEach((mes,index)=>{

            const reg=dadosLoja.find(
                i=>i.Ano===ano && i["Mês"]===mes
            );

            valores[index]=reg?Number(reg.Perdas):0;
        });

        return{
            label:ano,
            data:valores,
            borderWidth:2,
            tension:.35,
            fill:false
        };
    });

    return {mesesOrd,datasets};
}

async function montarGraficos(){

    const dados=await carregarDados();

    const lojas=agruparPorLoja(dados);

    /* GRAFICO GERAL */

    const mesesOrd=[
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    const anosGlobais=[...new Set(dados.map(d=>d.Ano))].sort();

    const datasetsGerais=anosGlobais.map(ano=>{

        const valores=new Array(12).fill(0);

        dados.forEach(item=>{
            if(item.Ano===ano){
                const idx=mesesOrd.indexOf(item["Mês"]);
                if(idx>=0){
                    valores[idx]+=Number(item.Perdas)||0;
                }
            }
        });

        return{
            label:ano,
            data:valores,
            borderWidth:2,
            tension:.35,
            fill:false
        };
    });

    criarGrafico(
        "graficoGeral",
        "Comparativo Geral de Perdas",
        mesesOrd,
        datasetsGerais
    );

    /* RANKING */

    const ranking=calcularRanking(dados);
    renderRanking(ranking);

    /* GRAFICOS POR LOJA */

    const container=document.getElementById("graficos-lojas");
    container.innerHTML="";

    Object.keys(lojas).forEach(lojaNome=>{

        const lojaDados=lojas[lojaNome];

        const {mesesOrd,datasets}=prepararSeries(lojaDados);

        const div=document.createElement("div");
        div.className="grafico-container";

        const idCanvas="grafico-"+lojaNome.replace(/[^a-zA-Z0-9]/g,"");

        div.innerHTML=`
            <h2>${lojaNome}</h2>
            <canvas id="${idCanvas}"></canvas>
        `;

        container.appendChild(div);

        criarGrafico(idCanvas,lojaNome,mesesOrd,datasets);

    });
}

montarGraficos();