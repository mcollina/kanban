
describe("kanban.Step", function () {

  var instance = null;
  var func = null;

  beforeEach(function () {
    func = sinon.spy();
    instance = new kanban.Step("awesome step", { wip: 2 }, func);
  });

  it("should have a wip", function () {
    expect(instance).to.have.property("wip", 2);
  });

  it("should have a writable wip", function () {
    instance.wip = 5;
    expect(instance).to.have.property("wip", 5);
  });

  it("should have set the wip from the constructor", function () {
    instance = new kanban.Step("awesome step", { wip: 1 }, func);
    expect(instance).to.have.property("wip", 1);
  });

  it("should have a current load", function () {
    expect(instance).to.have.property("current", 0);
  });

  it("should show that it is not full", function () {
    expect(instance.isFull()).to.be.false;
  });

  it("should show that it is full", function () {
    instance.current = instance.wip;
    expect(instance.isFull()).to.be.true;
  });

  it("should never be full if it has no wip", function () {
    instance = new kanban.Step("awesome step", func);
    instance.current = instance.current + 1; 
    expect(instance.isFull()).to.be.false;
  });
  
  describe("#execute", function () {

    var job = null;

    it("should call the func with three args", function () {
      job = { obj: "Matteo" };
      instance.execute(job);
      expect(func).to.be.calledWithMatch(job.obj, job, sinon.match.func);
    });

    it("should call the func with two args", function () {
      job = { obj: "Matteo" };
      func = function (a, b) {};
      func = sinon.spy(func);

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);

      expect(func).to.be.calledWithMatch(job.obj, sinon.match.func);
    });

    it("should increment current if executing", function () {
      job = { obj: "Matteo" };
      instance.execute(job);
      expect(instance).to.have.property("current", 1);
    });

    it("should not increment current if it is full", function () {
      instance.execute({ obj: "matteo" });
      instance.execute({ obj: "matteo" });
      instance.execute({ obj: "matteo" });
      expect(instance.isFull()).to.be.true;
    });

    it("should not increment current if it is full", function () {
      instance.execute({ obj: "matteo" });
      instance.execute({ obj: "matteo" });
      instance.execute({ obj: "matteo" });
      expect(instance).to.have.property("current", 2);
    });

    it("should call obj.executeNext after the function finishes", function () {
      job = { obj: "Matteo", executeNext: sinon.spy() };
      
      func = function (obj, cb) { cb(); };

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);

      expect(job.executeNext).to.be.calledOnce;
    });

    it("should call obj.executeNext with the generated error", function () {
      job = { obj: "Matteo", executeNext: sinon.spy() };
      var err = "error";
      
      func = function (obj, cb) { cb(err); };

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);

      expect(job.executeNext).to.be.calledWith(err);
    });

    it("should call obj.executeNext with an error if the step times out", function (done) {
      job = { 
        obj: "Matteo", 
        executeNext: function (err) {
          expect(err).to.be.instanceof(Error);
          done();
        }
      };
      var err = "error";
      
      func = function (obj, cb) { 
        // we do nothing here, we are stuck somewhere
      };

      instance = new kanban.Step("awesome step", { wip: 2, timeout: 10 }, func);
      instance.execute(job);
    });

    it("should work correctly if no timeout occurs", function (done) {
      job = { 
        obj: "Matteo", 
        executeNext: function (err) {
          done(err);
        }
      };

      func = function (obj, cb) { 
        cb();
      };

      instance = new kanban.Step("awesome step", { wip: 2, timeout: 10 }, func);
      instance.execute(job);
    });

    it("should restore the capacity after a completion", function () {
      job = { 
        obj: "Matteo", 
        executeNext: function (err, scheduled) { scheduled() ; }
      };
      
      func = function (obj, cb) { cb(); };

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);

      expect(instance).to.have.property("current", 0);
    });

    it("should restore the capacity after a completion even in case of error", function () {
      job = { 
        obj: "Matteo", 
        executeNext: function (err, scheduled) { scheduled() ; }
      };
      
      var err = "error";

      func = function (obj, cb) { cb(err); };

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);

      expect(instance).to.have.property("current", 0);
    });

    it("should completes all jobs", function () {
      job = { 
        obj: "Matteo", 
        executeNext: function (err, scheduled) { scheduled() ; }
      };

      var spy = sinon.spy(job, "executeNext");
      
      func = function (obj, cb) { cb(); };

      instance = new kanban.Step("awesome step", { wip: 2 }, func);
      instance.execute(job);
      instance.execute(job);
      instance.execute(job);

      expect(job.executeNext).to.be.calledThrice;
    });
  });
});
