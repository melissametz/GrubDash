const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res) => {
    res.json({data: dishes});
};
const idValidator = (req, res, next) => {
    const {data: {id} = {}} = req.body;
    if (id === undefined ||  id === null || id.length===0) {
        return next();
    };
    if (id && id === req.params.dishId) {
        return next();
    };
    next({status: 400, message: `id does not match ${id}`});
};
const nameValidator = (req, res, next) => {
    const {data: {name} = {} } = req.body;
    if (name) {
        res.locals.name = name;
        return next();
    };
    next({status: 400, message: "A 'name' property is required."});
};
const descValidator = (req, res, next) => {
    const {data: {description} = {} } = req.body;
    if (description) {
        res.locals.desc = description;
        return next();
    };
    next({status: 400, message: "A 'description' property is required."});
};
const priceValidator = (req, res, next) => {
    const {data: {price} = {} } = req.body;
    if (price > 0 && typeof(price)==='number') {
        res.locals.price = price;
        return next();
    };
    next({status: 400, message: "A 'price' property is required."});
};
const imgValidator = (req, res, next) => {
    const {data: {image_url} = {} } = req.body;
    if (image_url) {
        res.locals.imgurl = image_url;
        return next();
    };
    next({status: 400, message: "A 'image_url' property is required."});
};

const create = (req, res) => {
    const newDish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.desc,
        price: res.locals.price,
        image_url: res.locals.imgurl
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
};
const dishExists = (req, res, next) => {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dishId = dishId;
        res.locals.dish = foundDish;
        return next();
    };
    next({status: 404, message: `Dish id not found ${res.locals.dish}`});
};
const read = (req, res) => {
    res.json({data: res.locals.dish});
};
const update = (req, res) => {
    res.locals.dish = {
        id: res.locals.dishId,
        name: res.locals.name,
        description: res.locals.desc,
        price: res.locals.price,
        image_url: res.locals.imgurl
    };
    res.json({data: res.locals.dish});
};


module.exports = {
    list,
    create: [nameValidator, descValidator, priceValidator, imgValidator, create],
    read: [dishExists, read],
    update: [dishExists, nameValidator, descValidator, priceValidator, imgValidator, idValidator, update]
};