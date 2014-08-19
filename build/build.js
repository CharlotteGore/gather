
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("gather/index.js", function(exports, require, module){
var READY = -1,
	COMPLETE = 0,
	FAILED = 1,
	Gatherer,
	checkTasks;

function Gatherer(){

	this.reset();
	return this;

}

function checkTasks(){

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

	reset : function resetGathering(){

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

	task : function createTask( callback ){

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

	run : function runTasks( callback, timeout ){

		var self = this;

		if (timeout){

			setTimeout(function(){

				if (!self.isComplete){

					self.fn.complete('Error: Timed out');
					self.fn.complete = function(){};

				}


			}, timeout);

		}

		self.fn.complete = callback;

		// run the task callbacks...
		for (var i = 0, il = self.tasks.length; i < il; i++){
			self.tasks[i].fn();
		}

		return self;

	},

	update : function setUpdateCallback( callback ){
		this.fn.update = callback;
		return this;
	}

}

module.exports = Gatherer;
});