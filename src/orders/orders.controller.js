const { AsyncResource } = require("async_hooks");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
/*add handlers and middleware functions to create, read, 
update, delete, and list orders.*/

//checks order exists
const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.orderId = orderId;
    res.locals.foundOrder = foundOrder;
    console.log(foundOrder);
    return next();
  }
  next({ status: 404, message: `Order id not found ${orderId}` });
};

//checks for order pending status
const pendingCheck = (req, res, next) => {
  if (res.locals.foundOrder.status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
};

//checks deliver to property - must include
const deliverToValidator = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body;
  //console.log("Hello Friend", req.body);
  if (deliverTo) {
    res.locals.deliverTo = deliverTo;
    //console.log("Hello World", deliverTo);
    return next();
  }
  next({ status: 400, message: "A 'deliverTo' property is required." });
};

//checks mobile number property - must include
const mobileNumberValidator = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    res.locals.mobileNumber = mobileNumber;
    return next();
  }
  next({ status: 400, message: "A 'mobileNumber' property is required." });
};

//checks dish property - must include at least one and cannot be an array
const dishesValidator = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (dishes && Array.isArray(dishes) && dishes.length > 0) {
    res.locals.dishes = dishes;
    return next();
  }
  next({ status: 400, message: "A 'dishes' property is required." });
};

//checks id - must match :orderId from route
const idValidator = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  if (id === undefined || id === null || id.length === 0) {
    return next();
  }
  if (id && id === req.params.orderId) {
    return next();
  }
  next({ status: 400, message: `id does not match ${id}` });
};

//checks status of order - must include status
const statusValidator = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  if (status && status !== "invalid") {
    res.locals.status = status;
    return next();
  }
  next({ status: 400, message: "A 'status' property is required" });
};

//checks quantity property - must include
const quantityValidator = (req, res, next) => {
  res.locals.dishes.forEach((dish) => {
    if (!(dish.quantity > 0) || typeof dish.quantity !== "number") {
      const index = res.locals.dishes.indexOf(dish);
      return next({
        status: 400,
        message: `A 'quantity' property is required for dish ${index}.`,
      });
    }
  });

  next();
};

//list orders
const list = (req, res) => {
  res.status(200).json({ data: orders });
};

//create orders
const create = (req, res) => {
  const { data: { status } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: res.locals.deliverTo,
    mobileNumber: res.locals.mobileNumber,
    status,
    dishes: res.locals.dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

//update orders
const update = (req, res) => {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

    res.locals.foundOrder.deliverTo = deliverTo,
    res.locals.foundOrder.mobileNumber = mobileNumber,
    res.locals.foundOrder.status = status,
    res.locals.foundOrder.dishes = dishes;

  res.json({ data: res.locals.foundOrder });
};

//read orders
const read = (req, res) => {
  res.json({ data: res.locals.foundOrder });
};

//delete orders
const destroy = (req, res) => {
  const index = orders.indexOf(res.locals.foundOrder);
  orders.splice(index, 1);
  res.sendStatus(204);
};

//exports functions for use by router
module.exports = {
  list,
  create: [
    deliverToValidator,
    dishesValidator,
    mobileNumberValidator,
    quantityValidator,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    deliverToValidator,
    dishesValidator,
    mobileNumberValidator,
    quantityValidator,
    statusValidator,
    idValidator,
    update,
  ],
  delete: [orderExists, pendingCheck, destroy],
};
