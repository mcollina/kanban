
describe("kanban.Board", function () {

  var instance = null;

  beforeEach(function () {
    instance = new kanban.Board();
  });

  it("should exists", function () {
    expect(instance).to.exist;
  });

  it("should define a step and return itself", function () {
    var result = instance.defineStep("hello", function (obj, callback) {
      throw new Error("this should never be called");
    });
    expect(result).to.eql(instance);
  });

  it("should execute the defined step", function (done) {
    instance.defineStep("hello", function (obj, callback) {
      expect(obj).to.eql({ hello: "world" });
      callback();
    });

    instance.insert({ hello: "world" }, done);
  });

  it("should support dummy steps", function (done) {
    instance.defineStep("ahha").insert({ hello: "world" }, done);
  });


  it("should execute two steps", function (done) {
    var count = 0;
    var increase = function (obj, callback) {
      count = count + 1;
      callback();
    };

    instance.
      defineStep("a", increase).
      defineStep("b", increase);

    instance.insert({ hello: "world" }, function () {
      expect(count).to.equal(2);
      done();
    });
  });

  it("should forward an error", function (done) {
    instance.defineStep("a", function (obj, cb) {
      cb(new Error("hello"));
    }).defineStep("b", function (obj, cb) {
      throw new Error("this should never be called");
    });

    instance.insert({ hello: "world" }, function (err) {
      expect(err).to.be.defined;
      done();
    });
  });

  it("should execute a step with a wip 1", function (done) {
    instance.defineStep("hello", { wip: 1 }, function (obj, callback) {
      setTimeout(function () {
        callback();
      }, obj.ms);
    });

    var first = false;

    instance.insert({ ms: 20 }, function () {
      first = true;
    }).insert({ ms: 0 }, function () {
      expect(first).to.be.true;
      done();
    });
  });

  it("should forward an error even with a wip", function (done) {
    instance.defineStep("a", { wip: 1 }, function (obj, cb) {
      // dummy step
      process.nextTick(cb);
    }).defineStep("b", { wip: 1 }, function (obj, cb) {
      if(obj.name === "world") {
        cb(new Error("hello world"));
      } else {
        cb();
      }
    });

    instance.insert({ hello: "world" }, function (err) {
      expect(err).to.be.defined;
    }).insert({ hello: "matteo" }, done);
  });

  it("should set all the step.current to zero in case of errors", function () {
    instance.defineStep("a", { wip: 1 }, function (obj, cb) {
      // dummy step
      cb();
    }).defineStep("b", { wip: 1 }, function (obj, cb) {
      cb(new Error("hello world"));
    });

    instance.insert({ a: "b" }).insert({ hello: "world" });

    instance.steps.forEach(function (s) {
      expect(s).to.have.property("current", 0);
    });
  });

  it("should execute pass the Job instance to the step definition", function (done) {
    instance.defineStep("hello", function (obj, job, callback) {
      expect(job).to.be.instanceof(kanban.Job);
      callback();
    });

    instance.insert({ hello: "world" }, done);
  });

  it("should jump to a given step", function (done) {
    var called = false;

    instance.defineStep("a", { wip: 1 }, function (obj, job, cb) {
      job.jumpTo("c");
      cb();
    }).defineStep("b", { wip: 1 }, function (obj, cb) {
      cb(new Error("hello world"));
    }).defineStep("c").defineStep("d", function (obj, cb) {
      called = true;
      cb();
    });

    instance.insert({ a: "b" }, function () {
      expect(called).to.be.true;
      done();
    });
  });
});
