
var debug = require("debug")("kanban:job");

/**
 * A Job is used to wrap the object inserted in the Board.
 * It also collect the statistics of the duration of
 * each step.
 *
 * @api public
 * @param {Object} obj The object to be processed
 * @param {Array} steps The Step to be used by this Job
 * @param {Function} done The function that will be called
 */
function Job(obj, steps, done) {
  this.obj = obj;
  this._steps = steps;
  this.stats = {};
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
Job.prototype.executeNext = function (err, scheduled) {
  if (err) {
    if (scheduled) {
      scheduled();
    }
    this.done(err);
    return;
  }

  var that = this;

  var tracker = function (step) {

    if (that._startedStep) {
      var name = that._currentStep.name;
      var time = new Date() - that._startedStep;
      delete that._startedStep;
      delete that._currentStep;
    
      if (that.stats[name] === undefined) {
        that.stats[name] = time;
      } else {
        if (typeof that.stats[name] === "number") {
          that.stats[name] = [that.stats[name]];
        }

        if (typeof that.stats[name].push === "function") {
          that.stats[name].push(time);
        }
      }
    }

    if (step) {
      that._currentStep = step;
      that._startedStep = new Date();
    }
 
    if (scheduled) {
      scheduled();
    }
  };

  var step = this._steps.shift();
  
  if (step) {
    step.execute(this, tracker);
    return;
  } else {
    tracker();
  }

  this.done(null, this);
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
