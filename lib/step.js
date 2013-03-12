
var debug = require("debug")("kanban:step");

/**
 * A Step in the board.
 *
 * @api public
 * @param {String} name The name of the step
 * @param {Object} opts The options for this step
 * @param {Function} func The function that will be
 *  executed
 */
function Step(name, opts, func) {

  this.name = name;
  this._wip = opts.wip || Number.MAX_VALUE;
  this._current = 0;
  this._queue = [];
  this._func = func;
}
module.exports = Step;

/**
 * Execute a given Job
 *
 * @api public
 * @param {Job} job The job to execute.
 */
Step.prototype.execute = function (job) {
  var that = this;

  var schedule = function () {
    that._current = that._current + 1;

    var callback = function (err) {
      that._current = that._current - 1;
      job.executeNext(err);
    };

    var after = function (err) {
      debug("completed step " + that.name);

      if(that._queue.length > 0) {
        debug("step " + that.name + " has some job to drain");
        that._queue.shift()();
      }

      callback(err);
    };

    if (that._func.length == 2) {
      that._func(job.obj, after);
    } else {
      that._func(job.obj, job, after);
    }
  };

  if (this.isFull()) {
    debug("step " + this.name + " has no capacity, putting in the queue of " + this.name);
    this._queue.push(schedule);
    return;
  }

  schedule();
};

/**
 * Checks if a given step has some capacity left.
 *
 * @api public
 * @return {boolean} true if there is no capacity left, false otherwise
 */
Step.prototype.isFull = function () {
  return (this.wip - this.current) === 0;
};

/**
 * The number of the current jobs in the doing
 *
 * @api public
 * @return {Number}
 */
Object.defineProperty(Step.prototype, "current", {
  enumerable: true,
  configurable: false,
  get: function () {
    return this._current;
  }
});

/**
 * The maximum capacity of this step
 *
 * @api public
 * @return {Number}
 */
Object.defineProperty(Step.prototype, "wip", {
  enumerable: true,
  configurable: false,
  get: function () {
    return this._wip;
  }
});
