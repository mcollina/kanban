
var kanban = require("../");
var board = new kanban.Board();

board.defineStep("fast", { wip: 2 }, function (obj, done) {
  console.log("Fast step started for " + obj);
  setTimeout(function () {
    console.log("Fast step done for " + obj);
    done();
  }, 1000);
}).defineStep("slow", { wip: 1 }, function (obj, done) {
  console.log("Slow step started for " + obj);
  setTimeout(function () {
    console.log("Slow step done for " + obj);
    done();
  }, 5000);
});

var print = function (err, job) {
  console.dir(job); 
};

for (var i = 0; i < 15; i++) {
  board.insert(i, print);
}
