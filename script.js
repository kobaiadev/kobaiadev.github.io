const API_KEY = "5b7b286d2bdcfe133230f8b2f2ee5315"; // coloque sua chave GNews aqui
const QUERY = "supermercado segurança OR furto OR roubo OR perda";
const URL = `https://gnews.io/api/v4/search?q=${encodeURIComponent(QUERY)}&lang=pt&token=${API_KEY}&max=10`;

async function carregarNoticias() {
  const container = document.getElementById("noticias");
  container.innerHTML = "<p>Carregando...</p>";

  export async function fetch(request) {
  const url = 'https://www.abrappe.com.br';
  const res = await fetch(url);
  const html = await res.text();

  // Regex ou DOMParser (Cloudflare Workers suporta DOMParser experimental)
  // Aqui vamos usar regex simples para extrair títulos e links

  const regex = /<h3 class="elementor-post__title"><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/g;

  const noticias = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    noticias.push({
      titulo: match[2],
      link: match[1],
      data: null // O site não tem data visível facilmente, pode extrair se quiser
    });
  }

  return new Response(JSON.stringify(noticias), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}


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

carregarNoticias();
