/********************************************
 * 1) NOTÍCIAS GNEWS
 ********************************************/
const API_KEY = "5b7b286d2bdcfe133230f8b2f2ee5315";
const QUERY = "supermercado segurança OR furto OR roubo OR perda";
const URL = `https://gnews.io/api/v4/search?q=${encodeURIComponent(QUERY)}&lang=pt&token=${API_KEY}&max=10`;

async function carregarNoticias() {
  const container = document.getElementById("noticias");
  container.innerHTML = "<p>Carregando...</p>";

  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = "<p>Nenhuma notícia encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    data.articles.forEach(article => {
      const div = document.createElement("div");
      div.className = "noticia";
      div.innerHTML = `
        <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title || "—"}</a></h3>
        <p>${article.description || ""}</p>
        <small><strong>${article.source?.name || "Fonte"}</strong> - ${new Date(article.publishedAt).toLocaleDateString("pt-BR")}</small>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    container.innerHTML = "<p>Erro ao carregar notícias.</p>";
    console.error("Erro ao buscar notícias:", error);
  }
}

/********************************************
 * 2) NOTÍCIAS ABRAPPE
 ********************************************/
async function carregarNoticiasAbrappe() {
  const container = document.getElementById("noticias-abrappe");
  container.innerHTML = "<p>Carregando notícias da Abrappe...</p>";

  try {
    // 👉 Substitua abaixo pelo seu Worker real
    const res = await fetch("https://SEU_WORKER.cloudflare.workers.dev/api/abrappe");
    const dados = await res.json();

    if (!dados || dados.length === 0) {
      container.innerHTML = "<p>Nenhuma notícia da Abrappe encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    dados.forEach(noticia => {
      const div = document.createElement("div");
      div.className = "noticia";
      div.innerHTML = `
        <h3><a href="${noticia.link}" target="_blank" rel="noopener">${noticia.titulo || "—"}</a></h3>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    container.innerHTML = "<p>Erro ao carregar notícias da Abrappe.</p>";
    console.error(e);
  }
}

carregarNoticias();
carregarNoticiasAbrappe();

/********************************************
 * 3) DADOS — JSON estruturado (IDs removidos)
 * Inclui: Loja 09,10,11,25,28,36,48,53 — 2024 & 2025 month-by-month (zeros onde sem dado)
 ********************************************/
const DATA = {
  "Loja 09": {
    "2024": {
      "Janeiro": 187.88,"Fevereiro": 212.64,"Março": 361.96,"Abril": 273.81,"Maio": 217.78,
      "Junho": 254.09,"Julho": 433.11,"Agosto": 406.79,"Setembro": 284.16,"Outubro": 254.28,
      "Novembro": 374.45,"Dezembro": 382.97
    },
    "2025": {
      "Janeiro": 467.5,"Fevereiro": 423.99,"Março": 444.17,"Abril": 558.86,"Maio": 414.55,
      "Junho": 416.67,"Julho": 416.67,"Agosto": 592.73,"Setembro": 480.21,"Outubro": 335.62,
      "Novembro": 0,"Dezembro": 0
    }
  },
  "Loja 10": {
    "2024": {"Janeiro":48.93,"Fevereiro":28.86,"Março":120.9,"Abril":1.2,"Maio":45.93,"Junho":36.49,"Julho":37.54,"Agosto":38.21,"Setembro":26.98,"Outubro":17.89,"Novembro":13.92,"Dezembro":52.21},
    "2025": {"Janeiro":18.73,"Fevereiro":47.21,"Março":48.43,"Abril":28.7,"Maio":22.25,"Junho":33.66,"Julho":74.78,"Agosto":115.19,"Setembro":25.87,"Outubro":10.98,"Novembro":0,"Dezembro":0}
  },
  "Loja 11": {
    "2024": {"Janeiro":696.1,"Fevereiro":556.98,"Março":413.99,"Abril":363.15,"Maio":492.52,"Junho":399.33,"Julho":389.5,"Agosto":150.6,"Setembro":616.91,"Outubro":372.23,"Novembro":651.73,"Dezembro":572.37},
    "2025": {"Janeiro":530.52,"Fevereiro":352.6,"Março":721.69,"Abril":358.22,"Maio":621.39,"Junho":539.13,"Julho":583.64,"Agosto":598.31,"Setembro":703.01,"Outubro":709.22,"Novembro":0,"Dezembro":0}
  },
  "Loja 25": {
    "2024": {"Janeiro":266.7,"Fevereiro":348.24,"Março":237.2,"Abril":155.57,"Maio":108.06,"Junho":93.39,"Julho":140.35,"Agosto":309.28,"Setembro":76.6,"Outubro":185.27,"Novembro":246.28,"Dezembro":131.4},
    "2025": {"Janeiro":59.96,"Fevereiro":108.17,"Março":154.24,"Abril":234.07,"Maio":228.13,"Junho":70.39,"Julho":133.81,"Agosto":160.07,"Setembro":197.87,"Outubro":233.17,"Novembro":0,"Dezembro":0}
  },
  "Loja 28": {
    "2024": {"Janeiro":327.45,"Fevereiro":156.89,"Março":470.16,"Abril":372.12,"Maio":119.51,"Junho":343.41,"Julho":210.35,"Agosto":255.35,"Setembro":222.14,"Outubro":263.49,"Novembro":53.78,"Dezembro":168},
    "2025": {"Janeiro":96.78,"Fevereiro":131.81,"Março":324.99,"Abril":295.77,"Maio":42.98,"Junho":186.56,"Julho":46.7,"Agosto":302.07,"Setembro":136.89,"Outubro":162.04,"Novembro":0,"Dezembro":0}
  },
  "Loja 36": {
    "2024": {"Janeiro":118.31,"Fevereiro":81.37,"Março":202.32,"Abril":226.63,"Maio":258.67,"Junho":199.06,"Julho":167.83,"Agosto":82.12,"Setembro":214.61,"Outubro":94.08,"Novembro":145.09,"Dezembro":126.28},
    "2025": {"Janeiro":175.85,"Fevereiro":116.23,"Março":246.21,"Abril":195.54,"Maio":189.96,"Junho":114.26,"Julho":214.1,"Agosto":116.56,"Setembro":120.54,"Outubro":232.99,"Novembro":0,"Dezembro":0}
  },
  "Loja 48": {
    "2024": {"Janeiro":183.6,"Fevereiro":200.25,"Março":195.44,"Abril":130.62,"Maio":135.52,"Junho":254.99,"Julho":291.13,"Agosto":247.14,"Setembro":191.55,"Outubro":213.67,"Novembro":246.08,"Dezembro":394.93},
    "2025": {"Janeiro":340.18,"Fevereiro":326.2,"Março":754.34,"Abril":210.11,"Maio":195.32,"Junho":369.06,"Julho":404.12,"Agosto":622.18,"Setembro":286.17,"Outubro":354.96,"Novembro":0,"Dezembro":0}
  },
  "Loja 53": {
    "2024": {"Janeiro":269.3,"Fevereiro":276.16,"Março":331.68,"Abril":204.76,"Maio":258.67,"Junho":178.34,"Julho":204.26,"Agosto":183.79,"Setembro":119.97,"Outubro":288.12,"Novembro":223.76,"Dezembro":202.88},
    "2025": {"Janeiro":281.04,"Fevereiro":63.68,"Março":138.35,"Abril":110.77,"Maio":139.38,"Junho":99.22,"Julho":177.12,"Agosto":189.03,"Setembro":77.18,"Outubro":310.6,"Novembro":0,"Dezembro":0}
  }
};

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

/********************************************
 * Helpers
 ********************************************/
function lojasList(){ return Object.keys(DATA).sort(); }
function anosList(){
  const s = new Set();
  Object.values(DATA).forEach(loja => Object.keys(loja).forEach(ano=>s.add(ano)));
  return Array.from(s).sort();
}
function somaAnoPorLoja(ano){
  const out = [];
  Object.entries(DATA).forEach(([loja, years])=>{
    const months = years[ano] || MONTHS.reduce((a,m)=>{a[m]=0;return a;},{});
    const total = Object.values(months).reduce((a,b)=>a+Number(b||0),0);
    out.push({loja, total});
  });
  return out.sort((a,b)=>b.total - a.total);
}

/********************************************
 * 4) Desenhar gráficos
 ********************************************/
function drawComparativo(){
  const lojas = lojasList();
  const anoA = "2024", anoB = "2025";
  const vA = lojas.map(l=> {
    return MONTHS.map(m => Number(DATA[l][anoA]?.[m] || 0)).reduce((s,v)=>s+v,0);
  });
  const vB = lojas.map(l=> {
    return MONTHS.map(m => Number(DATA[l][anoB]?.[m] || 0)).reduce((s,v)=>s+v,0);
  });

  const tA = { x:lojas, y:vA, name:anoA, type:'bar' };
  const tB = { x:lojas, y:vB, name:anoB, type:'bar' };

  const layout = { barmode:'group', title:`Comparativo ${anoA} × ${anoB} (total anual por loja)`, yaxis:{title:'Perdas (Brt)'} };
  Plotly.newPlot('chart-comparativo', [tA,tB], layout, {responsive:true});
}

function drawLojaIndividual(loja){
  const traces = ["2024","2025"].map(ano=>{
    return {
      x: MONTHS,
      y: MONTHS.map(m => Number(DATA[loja][ano]?.[m] || 0)),
      mode:'lines+markers',
      name: ano
    };
  });
  const layout = { title:`Tendência mensal — ${loja}`, yaxis:{title:'Perdas (Brt)'} };
  Plotly.newPlot('chart-loja', traces, layout, {responsive:true});
}

function drawAllStoreCards(){
  const container = document.getElementById('stores-container');
  container.innerHTML = '';
  lojasList().forEach(loja=>{
    const id = loja.replace(/\s+/g,'_');
    const total2024 = MONTHS.map(m=>Number(DATA[loja]["2024"]?.[m]||0)).reduce((a,b)=>a+b,0);
    const total2025 = MONTHS.map(m=>Number(DATA[loja]["2025"]?.[m]||0)).reduce((a,b)=>a+b,0);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>${loja}</strong>
        <small>2024: ${total2024.toFixed(2)} — 2025: ${total2025.toFixed(2)}</small>
      </div>
      <div id="${id}" style="height:220px;"></div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn" data-target="${id}" data-format="png">Baixar PNG</button>
        <button class="btn" data-target="${id}" data-format="svg">Baixar SVG</button>
      </div>
    `;
    container.appendChild(card);

    // desenhar gráfico no id
    const traces = ["2024","2025"].map(ano=>{
      return {
        x: MONTHS,
        y: MONTHS.map(m => Number(DATA[loja][ano]?.[m] || 0)),
        mode:'lines',
        name: ano
      };
    });
    Plotly.newPlot(id, traces, {margin:{t:30},height:220}, {responsive:true});
  });

  // hook download buttons inside cards
  container.querySelectorAll('button[data-target]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const tgt = e.currentTarget.getAttribute('data-target');
      const fmt = e.currentTarget.getAttribute('data-format');
      await downloadPlotImage(tgt, fmt, `${tgt}.${fmt}`);
    });
  });
}

/********************************************
 * Download helpers (PNG & SVG)
 ********************************************/
async function downloadPlotImage(divId, format='png', filename='chart.png'){
  const gd = document.getElementById(divId);
  try {
    const opts = {format: format, width: Math.round(gd.offsetWidth*1.5), height: Math.round(gd.offsetHeight*1.5), scale:1};
    const imgData = await Plotly.toImage(gd, opts);
    const a = document.createElement('a');
    a.href = imgData;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err){
    alert('Erro ao exportar imagem: ' + (err.message || err));
    console.error(err);
  }
}

/********************************************
 * Inicialização UI
 ********************************************/
function initUI(){
  // preencher select loja
  const sel = document.getElementById('select-loja');
  lojasList().forEach(l => {
    const opt = document.createElement('option'); opt.value = l; opt.textContent = l; sel.appendChild(opt);
  });
  sel.value = lojasList()[0];

  sel.addEventListener('change', ()=> drawLojaIndividual(sel.value));

  // download comparativo
  document.getElementById('download-comp-png').addEventListener('click', ()=> downloadPlotImage('chart-comparativo','png','comparativo.png'));
  document.getElementById('download-comp-svg').addEventListener('click', ()=> downloadPlotImage('chart-comparativo','svg','comparativo.svg'));

  document.getElementById('download-loja-png').addEventListener('click', ()=> downloadPlotImage('chart-loja','png',`${sel.value}-tendencia.png`));
  document.getElementById('download-loja-svg').addEventListener('click', ()=> downloadPlotImage('chart-loja','svg',`${sel.value}-tendencia.svg`));

  document.getElementById('download-all-png').addEventListener('click', ()=> downloadPlotImage('chart-comparativo','png','comparativo-geral.png'));
}

/********************************************
 * Run
 ********************************************/
drawComparativo();
initUI();
drawLojaIndividual(lojasList()[0]);
drawAllStoreCards();
