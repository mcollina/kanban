
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

  describe("#executeNext", function () {
    it("should call done with error if an error is passed", function (done) {
      var nastyError = new Error("this is nasty");
      instance.done = function (err) {
        expect(err).to.equal(nastyError);
        done();
      };
      instance.executeNext(nastyError);
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
