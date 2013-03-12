
var debug = require("debug")("kanban:job");

/**
 * A Job is used to wrap the object inserted in the Board.
 *
 * @api public
 * @param {Object} obj The object to be processed
 * @param {Array} steps The Step to be used by this Job
 * @param {Function} done The function that will be called
 */
function Job(obj, steps, done) {
  this.obj = obj;
  this._steps = steps;
  this.done = done || function () {};
}
module.exports = Job;

/**
 * Execute the next step planned for the Job,
 * or the done function in case of errors or if
 * there are no more steps.
 *
 * @api private
 * @param {Error} err The error object of the previous call
 */
Job.prototype.executeNext = function (err) {
  if (err) {
    this.done(err);
    return;
  }

  var step = this._steps.shift();
  
  if (step !== undefined) {
    step.execute(this);
  } else {
    this.done();
  }
};

/**
 * Jump to the named step in the queue
 *
 * @api public
 * @param {String} name The name of the step
 */
Job.prototype.jumpTo = function (name) {
  while (this._steps.length > 0 &&
         this._steps[0].name !== name) {
    this._steps.shift();
  }
  return this;
};
