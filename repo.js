
const NodeCache = require('node-cache');
const uuid = require('uuid');
const _ = require('lodash');
const _cache = new NodeCache({ stdTTL: 600}); //10 minute TTL

function create(apiKey, recipe) {
  const id = uuid.v4();
  recipe.id = id;
  const cacheKey = apiKey + id;
  _cache.set(cacheKey, recipe);
  
  const idList = getIdList(apiKey);  
  idList.push(cacheKey);
  setIdList(apiKey, idList);
  
  return id;
}

function update(apiKey, id, recipe) {
  const existingRecipe = get(apiKey, id);
  
  if (existingRecipe == null) {
    throw new Error('Recipe does not exist');
  }
  
  const cacheKey = apiKey + id;
  _cache.set(cacheKey, _.assign(existingRecipe, recipe));
}

function get(apiKey, id) {
  return _cache.get(apiKey + id);
}

function list(apiKey) {
  const idList = getIdList(apiKey);
  const recipes = _cache.mget(idList);
  
  return _.values(recipes);
}

function deleteRecipe(apiKey, id) {
  const recipe = get(apiKey, id);
  
  if (recipe == null) { throw new Error('Recipe does not exist'); }
  
  const cacheKey = apiKey + id;
  _cache.del(cacheKey);
  const idList = getIdList(apiKey, id);
  setIdList(apiKey, _.remove(idList, k => k == cacheKey));
  
}

function dumpCache() {
  const keys = _cache.keys();
  
  return _cache.mget(keys);
}

function getIdList(apiKey) {
  
  const listKey = '_list-' + apiKey;
  var idList = _cache.get(listKey);
  
  if (!idList) { idList = []; }
  
  return idList;
}

function setIdList(apiKey, list) {
  
  const listKey = '_list-' + apiKey;
  _cache.set(listKey, list);
}

module.exports = {
  create: create,
  update: update,
  get: get,
  list: list,
  delete: deleteRecipe,
  dumpCache: dumpCache
}