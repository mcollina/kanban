
var debug = require("debug")("kanban:job");

function Job(obj, steps, done) {
  this.obj = obj;
  this._steps = steps;
  this.done = done || function () {};
}
module.exports = Job;

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
