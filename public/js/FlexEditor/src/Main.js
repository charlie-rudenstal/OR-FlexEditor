function Main(options) {
	this.domContainer = $(options.container);	
};

(function(me) {

	me.prototype.load = function() {

		var renderer = new Renderer();
		renderer.render();

		console.log(this.domContainer);

	};

}(Main));