"use strict";

var async = require("async");
var debug = require("debug")("kanban");

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

  var args = null, step = null;
  args = Array.prototype.slice.call(arguments, 0);

  step = {};
  step.name = args.shift();

  step.func = args.pop() || function (obj, cb) {
    // this function does nothing
    cb();
  };

  step.opts = args.shift() || {};
  step.opts.wip = step.opts.wip || Number.MAX_VALUE;
  step.current = 0;
  step.queue = [];

  this.steps.push(step);

  return this;
};

/**
 * Insert an object in the board
 *
 * @api public
 */
Board.prototype.insert = function (obj, done) {
  var that = this;

  debug("Inserted new job in the board");

  this.steps[0].current = this.steps[0].current + 1;

  async.series(this.steps.map(function (s, index) {
    return that.buildStep(index, obj);
  }), done);

  return this;
};

Board.prototype.buildStep = function (index, obj) {
  var steps = this.steps;
  var s = steps[index];

  return function (callback) {
    debug("executing step " + index);

    var next = steps[index + 1];

    var newCallback = function (err) {
      s.current = s.current - 1;
      if (next !== undefined) {
        next.current = next.current + 1;
      }
      callback(err);
    };

    s.func(obj, function (err) {

      debug("completed step " + index);

      if(err) {
        newCallback(err);
        return;
      }

      if (next === undefined || next.current < next.opts.wip) {
        debug("executing next step from " + index);
        newCallback();
      } else {
        debug("step " + (index + 1) + " has no capacity, putting in the queue of " + index);
        next.queue.push(newCallback);
      }

      if(s.queue.length > 0) {
        debug("step " + index + " has some job to drain");
        s.queue.shift()();
      }
    });
  };
};
