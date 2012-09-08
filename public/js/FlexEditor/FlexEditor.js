(function($) {
var Main = me;

function me() {

};

me.prototype.load = function() {

	var renderer = new Renderer();
	renderer.render();

};var Renderer = me;

function me() {

};

me.prototype.render = function() {



};

	/**
	 * Make Open Ratio a global object
	 * and export the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;

})(jQuery);