
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
});
