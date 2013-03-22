
var debug = require("debug")("kanban:step");

/**
 * A Step in the board.
 *
 * Options:
 *  - `wip`, the work in progress limit
 *  - `timeout`, the default timeout for this step
 *
 * @api public
 * @param {String} name The name of the step
 * @param {Object} opts The options for this step
 * @param {Function} func The function that will be
 *  executed
 */
function Step(name, opts, func) {

  this.name = name;
  this.wip = opts.wip || Number.MAX_VALUE;
  this._timeout = opts.timeout;
  this.current = 0;
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
Step.prototype.execute = function (job, scheduled) {
  var that = this;

  var schedule = function () {
    that.current = that.current + 1;

    var nextScheduled = function () {
      that.current = that.current - 1;

      if(that._queue.length > 0) {
        debug("step " + that.name + " has some job to drain");
        that._queue.shift()();
      }
    };

    var after = function (err) {
      debug("completed step " + that.name);
      job.executeNext(err, nextScheduled);
    };

    that._execute(job, after);

    if (scheduled) {
      scheduled(that);
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
 * Internal call to _func with a timer
 *
 * @api private
 */
Step.prototype._execute = function (job, after) {

  var that = this;

  if (that._timeout) {
    var oldAfter = after;

    var timer = setTimeout(function () {
      oldAfter(new Error("Step " + that.name + " timed out"));
    }, that._timeout);

    after = function (err) {
      clearTimeout(timer);
      oldAfter(err);
    };
  }

  if (that._func.length == 2) {
    that._func(job.obj, after);
  } else {
    that._func(job.obj, job, after);
  }
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
