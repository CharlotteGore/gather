var READY = -1,
	COMPLETE = 0,
	FAILED = 1,
	Gatherer,
	checkTasks;

Gatherer = function Gatherer(){

	this.reset();
	return this;

}

checkTasks = function(){

	var completed = this.tasksComplete + this.tasksFailed;
	var count = this.tasks.length;

	// post the percent complete..
	this.fn.update( Math.ceil(100 * (completed / count)));

	// and fire the complete callback when done, regardless of outcome
	if(completed >= count){

		this.isComplete = true;

		this.fn.complete( this.tasksFailed ? this.errors : null );
		
	}

	return;
};

Gatherer.prototype = {

	reset : function(){

		var self = this;

		this.tasks = [];
		this.fn = {
			complete : function(){},
			update : function(){}
		}
		this.isComplete = false;
		this.tasksComplete = 0;
		this.tasksFailed = 0;
		this.errors = [];

		return;

	},

	task : function( callback ){

		var self = this,
			task = { status : READY },
			done = function(){
				task.status = COMPLETE;
				self.tasksComplete++;
				checkTasks.call(self);	
			},
			error = function(err){
				task.status = FAILED;
				self.tasksFailed++;
				self.errors.push(err);
				checkTasks.call(self);
			};

		task.fn = function(){

			callback(done, error);

		}
		self.tasks.push(task);
		return self;

	},

	run : function( callback, timeout ){

		var self = this;

		if(timeout){

			setTimeout(function(){

				if(!self.isComplete){

					self.fn.complete('Error: Timed out');
					self.fn.complete = function(){};

				}


			}, timeout);

		}

		self.fn.complete = callback;

		// run the task callbacks...
		for(var i = 0, il = self.tasks.length; i < il; i++){
			self.tasks[i].fn();
		}

		return self;

	},

	update : function( callback ){
		this.fn.update = callback;
		return this;
	}

}

module.exports.gathering = function(){

	return new Gatherer();

}