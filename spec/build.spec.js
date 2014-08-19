describe("Gather", function(){

	var Gatherer = require('gather');

	describe("Build success/Framework", function(){

		it("Can load the module",function(){

			expect(Gatherer).toBeTruthy();

		})

	});

	describe("Gather instance", function(){


		it("can return a gathering object", function(){

			var gathering = new Gatherer();

			expect(gathering.task).toBeDefined();
			expect(gathering.run).toBeDefined();
			expect(gathering.update).toBeDefined();
			expect(gathering.reset).toBeDefined();

		});

		it("Can add tasks", function(){

			var gathering = new Gatherer();
			var fn = function(done, error){ done(); }

			expect(gathering.tasks.length).toBe(0);

			gathering.task(fn);

			expect(gathering.tasks.length).toBe(1);

			gathering.task(fn);

			expect(gathering.tasks.length).toBe(2);


		});

		it("can run sync tasks", function(){

			var gathering = new Gatherer();			
			var complete = false;
			var count = 0;

				gathering
				.task(function(done, error){
					count++;
					done()

				})
				.task(function(done, error){
					count++;
					done()

				});

				gathering.run(function(err){

					complete = true;

				});

				expect(complete).toBe(true);
				expect(count).toBe(2)

		});

		it("can run async tasks", function(){

			var gathering = new Gatherer();
			var complete = false;
			var count = 0;

			runs(function(){

				gathering
					.task(function(done){

						setTimeout(function(){
							count++;
							done();

						},50)

					})
					.task(function(done){

						setTimeout(function(){
							count++;
							done();

						},20)

					})
					.task(function(done){

						setTimeout(function(){
							count++;
							done()

						},30)

					})
					.run(function(err){

						complete = true;

					})

			});

			waitsFor(function(){

				return complete

			}, "complete to become true", 100);

			runs(function(){

				expect(complete).toBe(true);
				expect(count).toBe(3);

			})

		});

		it("correctly logs errors", function(){

			var gathering = new Gatherer();
			var complete = false;
			var count = 0;
			var errors = [];

			runs(function(){

				gathering
					.task(function(done, error){

						setTimeout(function(){
							count++;
							error("1 failed");

						},50)

					})
					.task(function(done, error){

						setTimeout(function(){
							count++;
							error("2 failed");

						},20)

					})
					.task(function(done, error){

						setTimeout(function(){
							count++;
							error("3 failed")

						},30)

					})
					.run(function(err){

						complete = true;
						errors = err;

					});

			});

			waitsFor(function(){

				return complete;

			}, "complete to become true", 100);

			runs(function(){

				expect(complete).toBe(true);
				expect(count).toBe(3);
				expect(errors).toContain("1 failed", "2 failed", "3 failed");

			})


		});

		it("updates correctly", function(){

			var gathering = new Gatherer();
			var complete = false;
			var count = 0;
			var spy = jasmine.createSpy();

			runs(function(){

				gathering
					.task(function(done){

						setTimeout(function(){
							count++;
							done();

						},50)

					})
					.task(function(done){

						setTimeout(function(){
							count++;
							done();

						},20)

					})
					.task(function(done){

						setTimeout(function(){
							count++;
							done()

						},30)

					})
					.task(function(done){

						setTimeout(function(){
							count++;
							done()

						},70)

					})
					.update( spy )
					.run(function(err){

						complete = true;

					})

			});

			waitsFor(function(){

				return complete

			}, "complete to become true", 100);

			runs(function(){

				expect(spy).toHaveBeenCalledWith(25);
				expect(spy).toHaveBeenCalledWith(50);
				expect(spy).toHaveBeenCalledWith(75);
				expect(spy).toHaveBeenCalledWith(100);

			})		

		})



	})

})