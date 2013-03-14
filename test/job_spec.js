
describe("kanban.Job", function () {
  var instance = null, steps = null, done = null, obj = null;

  beforeEach(function () {
    steps = [];
    done = function () {};
    obj = {};
    instance = new kanban.Job(obj, steps, done);
  });

  it("should have an object", function () {
    expect(instance).to.have.property("obj", obj);
  });

  it("should have some stats", function () {
    expect(instance.stats).to.be.eql({});
  });

  describe("#executeNext", function () {
    it("should call done with error if an error is passed", function (done) {
      var nastyError = new Error("this is nasty");
      instance.done = function (err) {
        expect(err).to.equal(nastyError);
        done();
      };
      instance.executeNext(nastyError);
    });

    it("should call done with itself", function (done) {
      instance.done = function (err, job) {
        expect(job).to.equal(instance);
        done();
      };
      instance.executeNext();
    });

    it("should call done if there are no more steps", function (done) {
      instance.done = done;
      instance.executeNext();
    });

    it("should execute the first step", function (done) {
      steps.push({ execute: function (job) { done(); } });
      instance.executeNext();
    });

    it("should execute three steps", function (done) {
      var count = 3;
      function donner() {
        if (--count === 0) {
          done();
        }
      }

      steps.push({ execute: donner });
      steps.push({ execute: donner });
      steps.push({ execute: donner });

      instance.executeNext();
      instance.executeNext();
      instance.executeNext();
    });

    it("should consume the steps", function () {
      function dummy() {}

      steps.push({ execute: dummy });
      steps.push({ execute: dummy });
      steps.push({ execute: dummy });

      instance.executeNext();
      instance.executeNext();
      instance.executeNext();

      expect(steps).to.be.eql([]);
    });

    it("should memorize the time between two executeNext as this step duration", function (done) {
  
      function dummy(job, scheduled) { scheduled(step); }
      var step = { name: "mystep", execute: dummy };

      steps.push(step);

      instance.executeNext();

      setTimeout(function () {
        instance.executeNext();
        expect(instance.stats.mystep).to.be.at.least(9);
        done();
      }, 10);
    });

    it("should memorize the time between two executeNext for the same step in an array", function (done) {
  
      function dummy(job, scheduled) { scheduled(step); }
      var step = { name: "mystep", execute: dummy };

      steps.push(step);
      steps.push(step);
      steps.push(step);
      steps.push(step);


      instance.executeNext();
      instance.executeNext();

      setTimeout(function () {
        instance.executeNext();
        instance.executeNext();
        expect(instance.stats.mystep[0]).to.be.at.least(0);
        expect(instance.stats.mystep[1]).to.be.at.least(9);
        done();
      }, 10);
    });
  });

  describe("#jumpTo", function () {

    beforeEach(function () {
      steps.push({ name: "a" });
      steps.push({ name: "b" });
      steps.push({ name: "c" });
    });

    it("should consume the steps to the given name", function () {
      instance.jumpTo("b");
      expect(steps).to.be.eql([{ name: "b" }, { name: "c" }]);
    });
  });
});
