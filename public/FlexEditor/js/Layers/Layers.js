function Layers(renderer) {

	var element;
	var layers = [];

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		element = elementContainer;
		
		var mouseInput = new MouseInput(element, null, true);
		mouseInput.start();

		$(mouseInput).on('mousedown', onItemDown.bind(this));

		this.render([]);
	}

	function onItemDown(e) {
		var index  = $(e.target).data('index');
		var layer = layers[index];
		var element = layer.element;
		$(this).trigger({ type: 'selection', 
						  element: element });
	}

	this.render = function(elements) {
		layers = [];
		for(var i in elements) {
			layers.push({
				name: "Test",
				selected: elements[i].selected,
				element: elements[i],
				index: i
			});
		}
		renderer.write(layers, element, Templates.Layer);
	}

}