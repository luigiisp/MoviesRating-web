import APIKey from '../config/key.js';

const movieContainer = document.getElementById("movie-container");
const loading = document.getElementById("loading");

let pendingRequests = 2; // Inicialmente temos duas requisições (dados do filme e comentários)

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const movieId = path.split('/').pop();
  
  let url = "";
  const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${APIKey}&language=pt-BR`;
  const showUrl = `https://api.themoviedb.org/3/tv/${movieId}?api_key=${APIKey}`;
  if (path.startsWith("/movie")) {
    url = movieUrl;
  } else {
    url = showUrl;
  }
  
  createMovieContent(url);
  loadComments(movieId);
});

function createMovieContent(url) {
  const movieTitle = document.getElementById("movie-title");
  const movieImg = document.getElementById("movie-img");
  const movieDesc = document.getElementById("movie-description");
  const movieRate = document.getElementById("movie-rate");

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const movie = JSON.parse(xhr.responseText);

        if (movie) {
          movieTitle.textContent = movie.title || movie.name;
          movieImg.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
          movieImg.alt = movie.title || movie.name;
          movieDesc.textContent = movie.overview;
          movieRate.textContent = movie.vote_average.toFixed(1).toString();
          document.title = `Rate - ${movieTitle.textContent.toUpperCase()}`;
          
          checkLoadingStatus();
        } else {
          console.log('Filme não encontrado', xhr.status);
        }
      } else {
        console.error('Erro ao buscar dados do filme:', xhr.status);
      }
    }
  };
  
  xhr.onerror = function () {
    console.error('Erro ao buscar dados do filme:', xhr.statusText);
  };
    
  xhr.send();
}

function loadComments(movieId) {
  const xhr = new XMLHttpRequest();
  const url = '../data/comments.json'; 

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (window.location.pathname.startsWith("/movie")) {
          for (const id in data.movies) {
            if (id.substring(1) === movieId) {
              if (data.movies.hasOwnProperty(id)) {
                const comments = data.movies[id];
                if (comments.length > 0) {
                  createCommentCards(comments);
                }
              }
              checkLoadingStatus();
              return;
            }
          }
        } else if (window.location.pathname.startsWith("/show")) {
          for (const id in data.shows) {
            if (id.substring(1) === movieId) {
              if (data.shows.hasOwnProperty(id)) {
                const comments = data.shows[id];
                if (comments.length > 0) {
                  createCommentCards(comments);
                }
              }
              checkLoadingStatus();
              return;
            }
          }
        }
      } else {
        console.error('Erro ao carregar os dados:', xhr.status, xhr.statusText);
      }
      checkLoadingStatus();
    }
  };

  xhr.open('GET', url, true);
  xhr.send();
}

function createCommentCards(comments) {
  const container = document.getElementById('comment-content');
  container.innerHTML = '';
  for (const comment of comments) {
    const card = document.createElement('div');
    card.classList.add("comment-card");

    const cardTop = document.createElement('div');
    cardTop.classList.add("comment-top");
    
    const author = document.createElement('p');
    author.classList.add("comment-author");
    author.textContent = comment.username;

    const image = document.createElement('i');
    image.classList.add("comment-img");
    image.classList.add("fa-regular");
    if (comment.rating === "like") {
      image.classList.add("fa-thumbs-up");
    } else {
      image.classList.add("fa-thumbs-down");

    }

    cardTop.appendChild(author);
    cardTop.appendChild(image);

    const text = document.createElement('p');
    text.classList.add("comment-text");
    text.textContent = comment.description;

    card.appendChild(cardTop);
    card.appendChild(text);

    container.appendChild(card);
  }
}

function checkLoadingStatus() {
  pendingRequests--;
  console.log(pendingRequests);
  if (pendingRequests === 0) {
    movieContainer.style.display = 'block';
    loading.style.display = 'none';
  }
}
