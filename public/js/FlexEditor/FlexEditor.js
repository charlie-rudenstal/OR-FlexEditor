(function($) {
function Main(options) {
	this.domContainer = $(options.container);	
};

(function(me) {

	me.prototype.load = function() {

		var renderer = new Renderer();
		renderer.render();

		console.log(this.domContainer);

	};

}(Main));function Renderer() {

};

(function(me) {
	
	me.prototype.render = function() {

	};

})(Renderer);
	/**
	 * Make Open Ratio a global object
	 * and export the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;

})(jQuery);