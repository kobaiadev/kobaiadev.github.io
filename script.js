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
        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
        <p>${article.description || ""}</p>
        <small><strong>${article.source.name}</strong> - ${new Date(article.publishedAt).toLocaleDateString()}</small>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    container.innerHTML = "<p>Erro ao carregar notícias.</p>";
    console.error("Erro ao buscar notícias:", error);
  }
}

async function carregarNoticiasAbrappe() {
  const container = document.getElementById("noticias-abrappe");
  container.innerHTML = "<p>Carregando notícias da Abrappe...</p>";

  try {
    const res = await fetch("https://SEU_WORKER.cloudflare.workers.dev/api/abrappe");
    const dados = await res.json();

    if (dados.length === 0) {
      container.innerHTML = "<p>Nenhuma notícia da Abrappe encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    dados.forEach(noticia => {
      const div = document.createElement("div");
      div.className = "noticia";
      div.innerHTML = `
        <h3><a href="${noticia.link}" target="_blank">${noticia.titulo}</a></h3>
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
