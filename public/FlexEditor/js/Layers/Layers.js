function Layers(renderer) {

	var renderToElement;
	var loadedElements;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		renderToElement = elementContainer;
		
		var mouseInput = new MouseInput(renderToElement, null, true);
		mouseInput.start();

		$(mouseInput).on('mousedown', onItemDown.bind(this));
		
		this.render([]);
	}

	function onItemDown(e) {
		var elementId  = $(e.target).data('element-id');
		var element = ElementCollection.getById(elementId);
		ElementCollection.select(element);
	}

	this.render = function(elements) {
		loadedElements = elements;
		renderer.write(elements, renderToElement, Templates.Layer, false, true);
	}

}