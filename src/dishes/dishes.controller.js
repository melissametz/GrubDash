const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
/*add handlers and middleware functions to create, 
read, update, and list dishes. Note that dishes cannot be deleted*/

//list dishes
function list(req, res) {
  res.json({ data: dishes });
};

//validates id - must include id
function idValidator(req, res, next) {
  const { data: { id } = {} } = req.body;
  if (id === undefined || id === null || id.length === 0) {
    return next();
  }
  if (id && id === req.params.dishId) {
    return next();
  }
  next({ status: 400, message: `id does not match ${id}` });
};

//validates name - must include name
function nameValidator(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    res.locals.name = name;
    return next();
  }
  next({ status: 400, message: "A 'name' property is required." });
};

//validates description - must include description
function descValidator(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    res.locals.desc = description;
    return next();
  }
  next({ status: 400, message: "A 'description' property is required." });
};

//validates price - must include price
function priceValidator(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price > 0 && typeof price === "number") {
    res.locals.price = price;
    return next();
  }
  next({ status: 400, message: "A 'price' property is required." });
};

//validates img_url - must include img_url
function imgValidator(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    res.locals.imgurl = image_url;
    return next();
  }
  next({ status: 400, message: "A 'image_url' property is required." });
};

//create new dish
function create(req, res) {
  const newDish = {
    id: nextId(),
    name: res.locals.name,
    description: res.locals.desc,
    price: res.locals.price,
    image_url: res.locals.imgurl,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

//Checks dish exists
function dishExists (req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dishId = dishId;
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish id not found ${res.locals.dish}` });
};

//reads dishes
function read(req, res) {
  res.json({ data: res.locals.dish });
};

//update dishes
function update(req, res) {
  const {
    data: { name, description, price, image_url/*, id*/ },
  } = req.body;

  //res.locals.dish.id = id;
  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.price = price;
  res.locals.dish.image_url = image_url;

  res.json({ data: res.locals.dish });
};

//exports functions for use by router
module.exports = {
  list,
  create: [nameValidator, descValidator, priceValidator, imgValidator, create],
  read: [dishExists, read],
  update: [
    dishExists,
    nameValidator,
    descValidator,
    priceValidator,
    imgValidator,
    idValidator,
    update,
  ],
};
