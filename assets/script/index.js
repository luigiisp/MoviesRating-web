import APIKey from '../config/key.js';
const imagePath = 'https://image.tmdb.org/t/p/w500';
const topContent = document.getElementById("top-content");
let movies = [];

// Função para buscar dados da API
function fetchMovies(url, sectionTitle, type) {
  fetch(url)
      .then(response => response.json())
      .then(data => {
          movies = data.results.slice(0, 6).map(movie => ({
              title: movie.title || movie.name,  // title para filmes e name para séries
              rating: movie.vote_average,
              image: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
              description: movie.overview
          }));
          appendSection(sectionTitle, movies, type);
      })
      .catch(error => {
          console.error(`Ocorreu um erro ao obter ${sectionTitle.toLowerCase()}`);
      });
}

const urls = [
  { url: `https://api.themoviedb.org/3/movie/popular?api_key=${APIKey}&language=pt-BR`, title: "Filmes Populares" , type: `movie`},
  { url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKey}&language=pt-BR`, title: "Melhores Filmes", type: `movie`},
  { url: `https://api.themoviedb.org/3/tv/popular?api_key=${APIKey}&language=pt-BR`, title: "Series Populares", type: `serie`},
  { url: `https://api.themoviedb.org/3/tv/top_rated?api_key=${APIKey}&language=pt-BR`, title: "Melhores Series", type: `serie` }
];

urls.forEach(({ url, title, type }) => fetchMovies(url, title, type));

function appendSection(title, items, type) {
    const section = document.createElement("section");
    
    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    const container = document.createElement("span");
    container.className = "container";
    
    items.forEach(item => {
        console.log(item.title);
        const card = createCard(item.title, item.rating.toFixed(1), item.image, item.description);
        card.classList.add(type)
        container.appendChild(card);
    });
    
    section.appendChild(container);
    topContent.appendChild(section);
}
function createCard(title, rating, image, description) {
    const card = document.createElement("div");
    card.className = "card";
    
    const img = document.createElement("img");
    img.className = "background";
    img.src = image;
    img.alt = "";
    card.appendChild(img);
    
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    
    const cardTitle = document.createElement("h3");
    cardTitle.className = "title";
    cardTitle.textContent = title;
    cardContent.appendChild(cardTitle);
    
    const ratingElement = document.createElement("p");
    ratingElement.textContent = rating + " Estrelas";
    cardContent.appendChild(ratingElement);
    
    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = description;
    cardContent.appendChild(descriptionElement);
    
    card.appendChild(cardContent);

    // Adicionar evento de clique para redirecionar ao link com o título do card
    card.addEventListener('click', () => {
      const formattedTitle = title.replace(/\s+/g, '-').toLowerCase(); // Formata o título para a URL
      card.classList.contains('movie') ? window.location.href = `${window.location.origin}/movie/${formattedTitle}` 
      : window.location.href = `${window.location.origin}/serie/${formattedTitle}`;
    });

    return card;
} 
