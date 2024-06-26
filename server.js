const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path')
const fs = require('fs');
const bodyParser = require('body-parser');
const { log } = require('console');
const { stringify } = require('querystring');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.set('views', path.join(__dirname,'assets' , 'html'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newData = req.body;

  const commentsPath
   = path.join(__dirname, 'assets', 'data', 'data.json');

  // Ler o conteúdo atual do arquivo data.json
  fs.readFile(commentsPath
    , 'utf8', (err, data) => {
      if (err) {
          if (err.code === 'ENOENT') {
              // Se o arquivo não existir, cria um novo array com os novos dados
              const dataArray = [newData];
              fs.writeFile(commentsPath
                , JSON.stringify(dataArray, null, 2), (err) => {
                  if (err) {
                      console.error('Erro ao salvar os dados em arquivo:', err);
                      return res.status(500).send('Erro ao salvar os dados em arquivo');
                  } else {
                      console.log('Dados salvos em arquivo com sucesso');
                      return res.status(200).send('Dados salvos em arquivo com sucesso');
                  }
              });
          } else {
              console.error('Erro ao ler o arquivo:', err);
              return res.status(500).send('Erro ao ler o arquivo');
          }
      } else {
          let dataArray;
          try {
              // Verifica se o conteúdo do arquivo é uma string vazia
              if (data.trim() === '') {
                  dataArray = [];
              } else {
                  dataArray = JSON.parse(data);
              }
          } catch (parseError) {
              console.error('Erro ao analisar o conteúdo do arquivo:', parseError);
              return res.status(500).send('Erro ao analisar o conteúdo do arquivo');
          }

          if (dataArray.some(user => user.username === newData.username) || dataArray.some(user => user.email === newData.email)) {
              return res.status(400).send('Nome de usuário ou email já existe');
          }

          // Adicionar os novos dados ao array existente
          dataArray.push(newData);
          res.cookie('username', newData.username, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          
          // Gravar o array atualizado de volta no arquivo
          fs.writeFile(commentsPath
            , JSON.stringify(dataArray, null, 2), (err) => {
              if (err) {
                  console.error('Erro ao salvar os dados em arquivo:', err);
                  return res.status(500).send('Erro ao salvar os dados em arquivo');
              } else {
                  console.log('Dados salvos em arquivo com sucesso');
                  return res.status(200).send('Dados salvos em arquivo com sucesso');
              }
          });
      }
  });
});

app.post('/login', (req, res) => {
  const newData = req.body;
  const commentsPath
   = path.join(__dirname, 'assets', 'data', 'data.json');

  fs.readFile(commentsPath
    , 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Se o arquivo não existir, o usuário não existe
        return res.status(400).send("O usuário não existe!");
      } else {
        // Outros erros de leitura de arquivo
        console.error('Erro ao ler o arquivo:', err);
        return res.status(500).send('Erro ao ler o arquivo');
      }
    } else {
      let dataArray;
      try {
        // Verifica se o conteúdo do arquivo é uma string vazia
        if (data.trim() === '') {
          dataArray = [];
          return res.status(400).send("O usuário não existe!");
        } else {
          dataArray = JSON.parse(data);
        }
      } catch (parseError) {
        console.error('Erro ao analisar o conteúdo do arquivo:', parseError);
        return res.status(500).send('Erro ao analisar o conteúdo do arquivo');
      }

      // Verifica a existência de contas com o usuário inserido
      const user = dataArray.find(user => user.username === newData.username);
      if (user) {
        if (user.password === newData.password) {
          res.cookie('username', user.username, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          return res.status(200).send('Login efetuado com sucesso!');
        }
        return res.status(400).send('Senha Incorreta!');
      } else {
        return res.status(400).send("O usuário não existe!");
      }
    }
  });
});

app.get('/check-login', (req, res) => {
  const username = req.cookies.username;
  if (username) {
      return res.status(200).send(`Usuário ${username} está logado.`);
  } else {
      return res.status(401).send('Usuário não está logado.');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.status(200).send('Logout efetuado com sucesso!');
});

app.get('/movie/:id', (req, res) => {
  res.render('movie-page');
});

app.get('/show/:id', (req, res) => {
  res.render('movie-page');
});

app.get('/movies/:page', (req, res) => {
  res.render('catalogue');
});

app.get('/shows/:page', (req, res) => {
  res.render('catalogue');
});

app.get('/movie/:id/rate', (req, res) => {
  const movieId = req.params.id;
  
  res.render('rate', { mediaType: "movie", id: movieId});
});

app.get('/show/:id/rate', (req, res) => {
  const showId = req.params.id;
  
  res.render('rate', { mediaType: "show", id: showId});
});

app.post('/movie/:id/rate', (req, res) => {
  return addRating(req, res, "movie");
});

app.post('/show/:id/rate', (req, res) => {
  return addRating(req, res, "show");
});

function addRating(req, res, mediaType) {
  let id = req.body.id;
  let movieId = 'i'+id;
  const username = req.body.username;
  const rating = req.body.rating;
  const description = req.body.description;

  const commentsPath
   = path.join(__dirname, 'assets', 'data', 'comments.json');
  
  fs.readFile(commentsPath
    , "utf8", (err, data) => {
    if(err && err.code !== "ENOENT") {
      console.error('Erro ao ler o arquivo de comentários:', err);
      return res.status(500).send('Erro ao salvar os dados em arquivo');
    }

    let dataArray = [];
    if(!err) {
      dataArray = JSON.parse(data)
      if(mediaType === "movie") {
        section = dataArray.movies;
      } else if(mediaType === "show") {
        section = dataArray.shows;
      }
    }

    let newRating = { "username": username, "rating": rating, "description": description}
    if (section[movieId]) {
      section[movieId].unshift(newRating);
     } else {
      section[movieId] = [newRating];
    }

    if(mediaType === "movie") {
      dataArray.movies = section;
    } else if(mediaType === "show") {
      dataArray.shows = section;
    }
    
    fs.writeFile(commentsPath
      , JSON.stringify(dataArray, null, 2), (err) => {
        if (err) {
            console.error('Erro ao salvar os dados em arquivo:', err);
            return res.status(500).send('Erro ao salvar os dados em arquivo');
        } else {
            console.log('Dados salvos em arquivo com sucesso');
            return res.status(200).send('Dados salvos em arquivo com sucesso');
        }
    });
  });
  res.redirect("/");
}

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});