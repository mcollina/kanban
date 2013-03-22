Kanban
===========

[![Build
Status](https://travis-ci.org/mcollina/kanban.png)](https://travis-ci.org/mcollina/kanban)

__Kanban__ is a node.js control-flow library.
As the Japanese methodology, it is pull-based. 

## Rationale

Node.js is all about concurrency: the more, the better.
If you use external tools, or slow external services,
you might reach a point were more concurrency reduce
your throughput.
You have to do something, and yet you have no data
to decide.

__Kanban__ focus is on recording stats and identifying bottlenecks.
Then, it helps you improving your system, by specifying 
a work-in-progress limit to limit the concurrency
of a processing step in your app.

## Install

```
npm install kanban --save
```

## Usage

As in kanban, there is a __Board__ and the processing of __Job__s
happens in __Step__s.

First, you must create a new __Board__:

```
var kanban = require("kanban");
var board = new kanban.Board();
```

Then, you define some tasks:

```
board.defineStep("fast", { wip: 2 }, function (obj, done) {
  console.log("Fast step started for " + obj);
  setTimeout(function () {
    console.log("Fast step done for " + obj);
    done();
  }, 1000);
});
board.defineStep("buffer");
board.defineStep("slow", { wip: 1 }, function (obj, done) {
  console.log("Slow step started for " + obj);
  setTimeout(function () {
    console.log("Slow step done for " + obj);
    done();
  }, 5000);
});
```

Note that the second and third parameters are optional.

Finally you insert some jobs in the __Board__:
```
var print = function (err, job) {
  // job is an instance of the Job class
  console.dir(job); 
};

for (var i = 0; i < 15; i++) {
  board.insert(i, print);
}
```

You can find more examples in the examples folder.

### Errors

The errors are handled in a pure node.js-style callbacks,
so you MUST call the callback with the error as the
first parameter.

If an error happens, the job is removed from the board
and the function you inserted with the job is called.

```
instance.defineStep("a", function (obj, job, cb) {
  cb(new Error("hello world"));
});

instance.insert({ a: "b" }, function (err) {
  console.log(err)
});
```

### Jumping to a specific step

It is possible to jump to a specific step in the board:

```
instance.defineStep("a", { wip: 1 }, function (obj, job, cb) {
  job.jumpTo("c");
  cb();
}).defineStep("b", { wip: 1 }, function (obj, cb) {
  cb(new Error("hello world"));
}).defineStep("c").defineStep("d", function (obj, cb) {
  cb();
});

instance.insert({ a: "b" }, function (err) {
  console.log(err)
});
```

### Timeouts

It is possible to specify a timeout for a given step, in milliseconds.

If a timeout happens, the job is removed from the board
and the function you inserted with the job is called.

```
// define a timeout of a minute
instance.defineStep("a", { timeout: 60 * 1000 }, function (obj, job, cb) {
  // this function is stuck somewhere, it will not complete
});

instance.insert({ a: "b" }, function (err) {
  console.log(err)
});
```

## Contributing to Kanban

* Check out the latest master to make sure the feature hasn't been
  implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't
  requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it
  in a future version unintentionally.
* Please try not to mess with the Makefile and package.json. If you
  want to have your own version, or is otherwise necessary, that is
  fine, but please isolate to its own commit so I can cherry-pick around
  it.

## LICENSE - "MIT License"

Copyright (c) 2013 Matteo Collina, http://matteocollina.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
