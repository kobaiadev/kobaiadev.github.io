// Versão melhorada: NÃO deixe a chave de API em código público.
const API_KEY_PLACEHOLDER = "YOUR_GNEWS_API_KEY"; // Troque por um endpoint seguro
const QUERY = "supermercado segurança OR furto OR roubo OR perda";
const MAX_RESULTS = 8;

function buildGNewsUrl(apiKey) {
  return `https://gnews.io/api/v4/search?q=${encodeURIComponent(QUERY)}&lang=pt&token=${apiKey}&max=${MAX_RESULTS}`;
}

// Utilitário: fetch com timeout
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function formatDatePt(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso; }
}

function createNoticiaCard(article) {
  const wrapper = document.createElement('article');
  wrapper.className = 'noticia card';

  const title = article.title || '(sem título)';
  const desc = article.description || '';
  const source = (article.source && article.source.name) ? article.source.name : 'Fonte desconhecida';
  const published = article.publishedAt ? formatDatePt(article.publishedAt) : '';

  wrapper.innerHTML = `
    <a class="card-link" href="${article.url}" target="_blank" rel="noopener noreferrer">
      <h3 class="card-title">${title}</h3>
      <p class="card-desc">${desc}</p>
      <div class="card-meta">
        <span class="card-source">${source}</span>
        <span class="card-date">${published}</span>
      </div>
    </a>
  `;

  return wrapper;
}

async function carregarNoticias() {
  const container = document.getElementById('noticias');
  if (!container) return;
  container.innerHTML = '<div class="spinner" aria-hidden="true"></div>';

  try {
    // Em vez de inserir a chave no front, o ideal é trocar API_KEY_PLACEHOLDER por um endpoint que
    // injete a chave no servidor (Cloudflare Worker, Netlify Function, etc.). Aqui deixamos como placeholder.
    const url = buildGNewsUrl(API_KEY_PLACEHOLDER);
    const res = await fetchWithTimeout(url, 10000);
    if (!res.ok) {
      container.innerHTML = `<p class="message">Erro ao carregar notícias (status ${res.status}).</p>`;
      return;
    }
    const data = await res.json();
    const articles = data.articles || [];

    if (articles.length === 0) {
      container.innerHTML = '<p class="message">Nenhuma notícia encontrada.</p>';
      return;
    }

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'noticias-grid-inner';
    articles.forEach(a => grid.appendChild(createNoticiaCard(a)));
    container.appendChild(grid);
  } catch (err) {
    if (err.name === 'AbortError') {
      container.innerHTML = '<p class="message">Tempo de conexão esgotado ao buscar notícias.</p>';
    } else {
      container.innerHTML = '<p class="message">Erro ao carregar notícias.</p>';
      console.error(err);
    }
  }
}

async function carregarNoticiasAbrappe() {
  const container = document.getElementById('noticias-abrappe');
  if (!container) return;
  container.innerHTML = '<div class="spinner" aria-hidden="true"></div>';

  try {
    // Troque pela URL do seu worker/endpoint
    const res = await fetchWithTimeout('https://SEU_WORKER.cloudflare.workers.dev/api/abrappe', 10000);
    if (!res.ok) {
      container.innerHTML = `<p class="message">Erro ao carregar notícias da Abrappe (status ${res.status}).</p>`;
      return;
    }
    const dados = await res.json();
    if (!Array.isArray(dados) || dados.length === 0) {
      container.innerHTML = '<p class="message">Nenhuma notícia da Abrappe encontrada.</p>';
      return;
    }

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'noticias-grid-inner';
    dados.forEach(n => {
      const card = document.createElement('article');
      card.className = 'noticia card';
      card.innerHTML = `
        <a class="card-link" href="${n.link}" target="_blank" rel="noopener noreferrer">
          <h3 class="card-title">${n.titulo}</h3>
        </a>
      `;
      grid.appendChild(card);
    });
    container.appendChild(grid);
  } catch (e) {
    if (e.name === 'AbortError') {
      container.innerHTML = '<p class="message">Tempo de conexão esgotado ao buscar notícias da Abrappe.</p>';
    } else {
      container.innerHTML = '<p class="message">Erro ao carregar notícias da Abrappe.</p>';
      console.error(e);
    }
  }
}

// Inicialização leve: aguarda DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    carregarNoticias();
    carregarNoticiasAbrappe();
    renderProjects();
  });
} else {
  carregarNoticias();
  carregarNoticiasAbrappe();
  renderProjects();
}

// ----------------------
// Projects (case studies) - render simples para portfolio
const projectsData = [
  {
    id: 'loja-11',
    title: 'Análise Individualizada — Loja 11',
    summary: 'Painel analítico mensal para identificar picos de perdas e gerar alertas operacionais.',
    tags: ['HTML', 'JavaScript', 'Relatórios'],
    thumbnailText: 'Loja 11',
    url: 'projects/loja-11.html'
  }
];

function renderProjects() {
  const container = document.getElementById('projects');
  if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'noticias-grid-inner';
  projectsData.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <a class="card-link" href="${p.url}">
        <div class="project-thumbnail">${p.thumbnailText}</div>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.summary}</p>
        <div class="project-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </a>
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// ----------------------
// Dados e funções de análise e relatório (migrados do index.html)
const analiseDados = [
  {
    loja: 'Loja 09',
    meses: { Janeiro: 467.5, Fevereiro: 423.99, Março: 444.17, Abril: 558.86, Maio: 414.55 },
    total: 2309.07,
    media: 461.81,
    destaque: 'Abril teve o maior valor registrado de perdas.'
  },
  {
    loja: 'Loja 10',
    meses: { Janeiro: 18.73, Fevereiro: 47.21, Março: 48.43, Abril: 28.7, Maio: 22.25 },
    total: 165.32,
    media: 33.06,
    destaque: 'Loja com menor volume total de perdas.'
  },
  {
    loja: 'Loja 11',
    meses: { Janeiro: 530.52, Fevereiro: 352.6, Março: 721.69, Abril: 358.22, Maio: 621.39 },
    total: 2584.42,
    media: 516.88,
    destaque: 'Destaque: Maior perda total e maior valor em um único mês (março).'
  },
  {
    loja: 'Loja 25',
    meses: { Janeiro: 59.96, Fevereiro: 108.17, Março: 154.24, Abril: 234.07, Maio: 228.13 },
    total: 784.57,
    media: 156.91,
    destaque: ''
  },
  {
    loja: 'Loja 28',
    meses: { Janeiro: 96.78, Fevereiro: 131.81, Março: 324.99, Abril: 295.77, Maio: 42.98 },
    total: 892.33,
    media: 178.47,
    destaque: ''
  },
  {
    loja: 'Loja 36',
    meses: { Janeiro: 175.85, Fevereiro: 116.23, Março: 246.21, Abril: 195.54, Maio: 189.96 },
    total: 923.79,
    media: 184.76,
    destaque: ''
  },
  {
    loja: 'Loja 48',
    meses: { Janeiro: 340.18, Fevereiro: 326.2, Março: 754.34, Abril: 210.11, Maio: 195.32 },
    total: 1826.15,
    media: 365.23,
    destaque: 'Março: maior valor de perdas entre todas as lojas.'
  },
  {
    loja: 'Loja 53',
    meses: { Janeiro: 281.04, Fevereiro: 63.68, Março: 138.35, Abril: 110.77, Maio: 139.38 },
    total: 733.22,
    media: 146.64,
    destaque: ''
  }
];

const relatorioDados = {
  topProdutos: [
    { produto: 'BRINQ LIDER/DEDOCHES OVO TURMA MONICA', perda: 'R$ 98,61', lojas: 'Loja 009 (R$ 53,70), Loja 025 (R$ 44,91)' },
    { produto: 'SBP 45NOITES RF.50%DESC.SEG.UN.SUAV', perda: 'R$ 38,74', lojas: 'Loja 009 e Loja 011 (R$ 19,37 cada)' },
    { produto: 'DESOD.GIOVANNA B.AERO 2X150M.30%DES CLASSIC', perda: 'R$ 32,70', lojas: 'Loja 009 e Loja 011 (R$ 16,35 cada)' },
    { produto: 'CHOC ARCOR TORTUGUITA 134.5G.SORTID', perda: 'R$ 20,42', lojas: 'Loja 028 (R$  10,22), Loja 011 (R$ 10,20)' },
    { produto: 'DESOD.GIOVANNA BABY ROLL-ON 2X50ML BLUE', perda: 'R$ 17,95', lojas: 'Loja 036 (R$ 9,34), Loja 011 (R$ 8,61)' }
  ],
  lojasFrequencia: [
    { loja: 'Loja 011 (V.VERDE)', produtos: 19, obs: 'Alta recorrência em itens de mercearia e higiene' },
    { loja: 'Loja 009 (COLONIAL)', produtos: 16, obs: 'Alto impacto financeiro em diversos produtos' },
    { loja: 'Loja 048 (LORENA)', produtos: 11, obs: 'Foco em bebidas lácteas e bomboniere' },
    { loja: 'Loja 025 (TAUBATE1)', produtos: 5, obs: 'Menor quantidade, mas com altos valores unitários' },
    { loja: 'Loja 036 (V.REDOND)', produtos: 4, obs: 'Produtos variados, valores mais baixos' }
  ],
  categorias: [
    'Bomboniere / Chocolates (ex: M&Ms, Twix, Tortuguita, Serenata, Sonho de Valsa)',
    'Higiene Pessoal (ex: Giovanna Baby, SBP, Desodorantes)',
    'Bebidas Lácteas (ex: Yakult, Toddynho, Italakinho)',
    'Infantil / Brinquedos (ex: Dedoches Turma da Mônica)'
  ]
};

function formatBrt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Brt';
}

function gerarAnalise(dados, filtro = '') {
  const container = document.getElementById('analiseContent');
  if (!container) return;
  const filtroLower = (filtro || '').toLowerCase();

  const dadosFiltrados = dados.filter(item => {
    if (!filtro) return true;
    if (item.loja.toLowerCase().includes(filtroLower)) return true;
    for (const mes in item.meses) {
      if (mes.toLowerCase().includes(filtroLower)) return true;
    }
    return false;
  });

  if (dadosFiltrados.length === 0) {
    container.innerHTML = '<p class="message">Nenhum resultado encontrado para sua busca.</p>';
    return;
  }

  let html = '';
  dadosFiltrados.forEach(({ loja, meses, total, media, destaque }) => {
    html += `<article style="margin-bottom:1.5rem;">
      <h2 style="color:#1e40af;">${loja}</h2>
      <table aria-label="Perdas mensais da ${loja}">
        <thead><tr><th>Mês</th><th>Valor</th></tr></thead>
        <tbody>
        ${Object.entries(meses).map(([mes, val]) => `<tr><td>${mes}</td><td>${formatBrt(val)}</td></tr>`).join('')}
        </tbody>
        <tfoot>
          <tr><th>Total</th><th>${formatBrt(total)}</th></tr>
          <tr><th>Média Mensal</th><th>${formatBrt(media)}</th></tr>
        </tfoot>
      </table>
      ${destaque ? `<p><strong>🔎 ${destaque}</strong></p>` : ''}
    </article>`;
  });

  container.innerHTML = html;
}

function gerarRelatorio(dados) {
  const container = document.getElementById('relatorioContent');
  if (!container) return;

  let html = `<section>
    <h2 style="color:#1e40af;">🔝 Top 5 Produtos com Maior Perda Total em Múltiplas Lojas</h2>
    <table aria-label="Top 5 Produtos com maior perda">
      <thead><tr><th>Produto</th><th>Perda Líquida Total</th><th>Lojas com Maior Incidência</th></tr></thead>
      <tbody>
        ${dados.topProdutos.map(p => `<tr><td>${p.produto}</td><td>${p.perda}</td><td>${p.lojas}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>`;

  html += `<section>
    <h2 style="color:#1e40af;">🏬 Lojas com Maior Frequência de Incidência</h2>
    <table aria-label="Lojas com maior frequência de incidência">
      <thead><tr><th>Loja</th><th>Nº de Produtos com Incidência</th><th>Observações</th></tr></thead>
      <tbody>
        ${dados.lojasFrequencia.map(l => `<tr><td>${l.loja}</td><td>${l.produtos}</td><td>${l.obs}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>`;

  html += `<section>
    <h2 style="color:#1e40af;">📊 Categorias Mais Incidentes</h2>
    <ul>
      ${dados.categorias.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </section>`;

  container.innerHTML = html;
}

// Abas e busca
function setupTabsAndSearch() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      const targetId = tab.getAttribute('aria-controls');
      tabContents.forEach(tc => tc.classList.toggle('active', tc.id === targetId));

      const target = document.getElementById(targetId);
      if (target) target.focus();
    });
  });

  const inputBusca = document.getElementById('searchInput');
  if (inputBusca) {
    inputBusca.addEventListener('input', () => gerarAnalise(analiseDados, inputBusca.value));
  }
}

// Inicialização complementar no DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // existing initializers already call carregarNoticias and renderProjects
    gerarAnalise(analiseDados);
    gerarRelatorio(relatorioDados);
    setupTabsAndSearch();
  });
} else {
  gerarAnalise(analiseDados);
  gerarRelatorio(relatorioDados);
  setupTabsAndSearch();
}
