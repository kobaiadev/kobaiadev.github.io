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
  });
} else {
  carregarNoticias();
  carregarNoticiasAbrappe();
}
