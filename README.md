
# Gather

  Fire a callback when other async tasks are complete. For Browserify.

## Installation

    $ npm install gm-gather

## API

### new Gather()

```js
var Gather = require('gm-gather');
var gathering = new Gather();
```

Create a new instance of gather. 

### gathering.task( callback )

```js

// create a task for the gathering to run. call 
// done if the task completes successfully, call
// error if the task fails.

gathering.task(function (done, error){
	
	ajax.load(uri, function(err, data){

		if (!err){
			processData(data);
			done();
		} else {
			error();
		}

	})

});
```

Create a new task. When tasks are called, they are passed `done` and `error` as arguments. These are both functions. Call `done` when the task has completed successfully. Call `error` when the task has failed. You can pass details of the error to `error`.

### gathering.run( callback [, timeout] )

```js
gathering.run(function (err){
	
	if (!err){
		// Yay, all my tasks were successful..
	}

}, 3000);
```

Run all the tasks asychronously, calling this callback when they're all complete. The callback receieves an array of errors passed to `error` by tasks.

Optionally you set a time limit with `timeout`.

### gathering.update( callback )

You can, if you desire, set a callback to fire every time on of the task completes. This callback is passed the percentage complete from 0 to 100. This is intended to be used for progress bars, etc. 

### gathering.reset()

Reset the gathering so that it can be reused.

## Example

Create a new Gathering:
```
var sequence = new Gather;
```

Add some tasks. Tasks tell Gather that they're done by calling either `done()` or `error()` 
```
sequence
	.task(function(done, error){	
		// task callbacks are passed two functions, 'done' and 'error'
		doSomeAsyncThing(function(err){
			if(!err){
			    // this task has completed successfully. let's call 'done'
				done();
			}else{
				error(err);
			}
		})
	})
	.task(function(done, error){	
		doADifferentAsyncThing(function(err){
			if(!err){
				done();
			}else{
				// uh oh, this task has failed! Let's pass the error on.
				error(err);
			}
		})
	})
	.task(function(done, error){	
		alsoDoThisAsyncThing(function(err){
			if(!err){
				done();
			}else{
				error(err);
			}
		})
	});
```

Run all the tasks, calling a callback when they're all finished, one way or another.
```
sequence.run(function(err){
	// this callback is passed an array of all the errors generated.
	if(!err){
		// Hurray! No errors! All the tasks completed successfully!
	} else {
		// Oh no, a number of tasks failed. err will be an array of all the errors collected.
	}
})
```

## License

  MIT
