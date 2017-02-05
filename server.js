// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const repo = require('./repo');


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/recipes", function (request, response) {
  const apiKey = getApiKey(request, response);
  const recipes = repo.list(apiKey);
  response.send(recipes);
});

app.post("/recipes", function (request, response) {
  const apiKey = getApiKey(request, response);
  
  const recipe = request.body;
  const errors = validate(recipe);
  if (errors.length > 0) {
    response.status(400).send(errors);
    return;
  }
  
  var id = repo.create(apiKey, recipe);
  response.status(200).send({ id: id });
});

app.put("/recipes/:recipeId", function (request, response) {
  const apiKey = getApiKey(request, response);
  
  const recipe = request.body;
  const errors = validate(recipe);
  if (errors.length > 0) {
    response.status(400).send(errors);
    return;
  }
  
  try {
    repo.update(apiKey, request.params.recipeId, recipe);
  }
  catch (e) {
    if (e.message = 'Recipe does not exist') {
      response.status(404).send('Recipe does not exist');
    }
    else throw e;
  }
  response.sendStatus(204);
});

app.get("/recipes/:recipeId", function (request, response) {
  const apiKey = getApiKey(request, response);
    
  const recipe = repo.get(apiKey, request.params.recipeId);
  if (recipe == null) {
      response.status(404).send('Recipe does not exist');
  }
  else response.send(recipe);
});

app.del("/recipes/:recipeId", function (request, response) {
  const apiKey = getApiKey(request, response);
  
  try {
    repo.delete(apiKey, request.params.recipeId);
  }
  catch (e) {
    if (e.message = 'Recipe does not exist') {
      response.status(404).send('Recipe does not exist');
    }
    else throw e;
  }
  response.sendStatus(200);
});

app.get("/recipe_cache", function (request, response) {
  response.send(repo.dumpCache());
});

function getApiKey(request, response) {
  const key = request.headers.authorization;
  
  if (!key) {
    response.status(401).send('Must specify a unique ID in Authorization header');
    throw new Error('Unauthorized');
  }
  
  return key;
}

function validate(recipe) {
  const errors = [];
  
  if (!recipe.name) {
    errors.push('Name is required');
  }
  
  if (!recipe.description) {
    errors.push('Description is required');
  }
  
  if (!recipe.author) {
    errors.push('Author is required');
  }
  
  if (recipe.rating != null && (recipe.rating < 1 || recipe.rating > 5)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return errors;
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
