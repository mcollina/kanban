"use strict";

var debug = require("debug")("kanban:board");
var Step  = require("./step");
var Job = require("./job");

/**
 * Initialize a new kanban board
 *
 * @api public
 */
function Board() {
  this.steps = [];

  this.defineStep("backlog");
}
module.exports = Board;

/**
 * Defines a new step on the kanban board
 *
 * Options:
 * - `wip`, execute this step with the specified concurrency.
 *
 * @api public
 * @param {String} name The step name
 * @param {Object} opts The options (optional)
 * @param {Function} step The function that will execute the step.
 *  this will be called with executed object and a 'finish' callback.
 *  If not provided it will run a dummy one.
 * @return {Board} the current object, for a fluent API
 */
Board.prototype.defineStep = function () {
  
  var args = null, func = null, opts = null, name = null;

  args = Array.prototype.slice.call(arguments, 0);

  name = args.shift();

  func = args.pop() || function (obj, cb) {
    // this function does nothing
    cb();
  };

  opts = args.shift() || {};

  debug("Defined step " + name);

  this.steps.push(new Step(name, opts, func));

  return this;
};

/**
 * Insert an object in the board
 *
 * @api public
 * @param {Object} obj The task to be inserted in the board
 * @param {Function} done A function that will be called
 *  when the task is finished.
 * @return {Board} the current object, for a fluent API
 */
Board.prototype.insert = function (obj, done) {
  var that = this;

  debug("Inserted new job in the board");

  // cloning the steps, so the Job will not consume them
  var job = new Job(obj, this.steps.slice(0), done);

  job.executeNext();

  return this;
};
