const API_KEY = "5b8fffed1d434579b4381bc711c4a40f"; // coloque sua chave da NewsAPI aqui
const QUERY = "furto supermercado OR perdas OR roubo supermercado";
const urlOriginal = `https://newsapi.org/v2/everything?q=${encodeURIComponent(QUERY)}&language=pt&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;
const URL = `https://corsproxy.io/?${encodeURIComponent(urlOriginal)}`;

async function carregarNoticias() {
  const container = document.getElementById("noticias");
  container.innerHTML = "<p>Carregando...</p>";

  try {
    const resposta = await fetch(URL);
    const dados = await resposta.json();

    if (!dados.articles || dados.articles.length === 0) {
      container.innerHTML = "<p>Nenhuma notícia encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    dados.articles.forEach((artigo) => {
      const div = document.createElement("div");
      div.className = "noticia";
      div.innerHTML = `
        <h3><a href="${artigo.url}" target="_blank">${artigo.title}</a></h3>
        <p>${artigo.description || ""}</p>
        <small><strong>${artigo.source.name}</strong> - ${new Date(artigo.publishedAt).toLocaleDateString()}</small>
      `;
      container.appendChild(div);
    });
  } catch (erro) {
    container.innerHTML = "<p>Erro ao carregar notícias.</p>";
    console.error("Erro ao buscar notícias:", erro);
  }
}

carregarNoticias();
