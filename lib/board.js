"use strict";

var async = require("async");

/**
 * Initialize a new kanban board
 *
 * @api public
 */
function Board() {
  this.steps = [];
}
module.exports = Board;

/**
 * Defines a new step on the kanban board
 *
 * @api public
 * @param {String} name The step name
 * @param {Function} step The function that will execute the step.
 *  this will be called with executed object and a 'finish' callback.
 * @return {Board} the current object, for a fluent API
 */
Board.prototype.defineStep = function (name, step) {
  this.steps.push(step);
  return this;
};

/**
 * Insert an object in the board
 *
 * @api public
 */
Board.prototype.insert = function (obj, done) {
  async.series(this.steps.map(function (s) {
    return async.apply(s, obj);
  }), done);
  return this;
};
