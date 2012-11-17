function Layers(renderer) {

	var renderToElement;
	var loadedElements;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		renderToElement = elementContainer;
		
		// Check for mouse down on items
		var mouseInput = new MouseInput(renderToElement, null, true);
		mouseInput.start();
		$(mouseInput).on('mousedown', onItemDown.bind(this));

		registerKeyHandler();

		// And render it (currently with no elements)
		this.render([]);
	}

	// Will select the element in the ElementCollection on click
	function onItemDown(e) {
		var elementId  = $(e.target).data('element-id');
		var element = ElementCollection.getById(elementId);
		ElementCollection.select(element);
	}

	// Will switch selection between elements with Shift+Up and Shift+Down
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyDown = 40;
			var keyUp = 38;
			if(e.shiftKey && !e.altKey) {
				// Find which element in the layer list is selected
				var selectedElement = ElementCollection.getSelected();
				var selectedLayerIndex = -1;
				for(var i in loadedElements) {
					if(loadedElements[i] == selectedElement) selectedLayerIndex = i;
				}

				if(e.keyCode == keyDown) {
					var selectLayerIndex = parseInt(selectedLayerIndex) + 1;
					if(selectLayerIndex >= loadedElements.length) selectLayerIndex = 0;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
				if(e.keyCode == keyUp) {
					var selectLayerIndex = parseInt(selectedLayerIndex) - 1;
					if(selectLayerIndex < 0) selectLayerIndex = loadedElements.length - 1;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
			}
		});
	}

	this.render = function(elements) {
		loadedElements = cloneArrayShallow(elements);
		loadedElements.reverse(); // reverse our copy to get latest layer at top
		renderer.write(loadedElements, renderToElement, Templates.Layer, true, true);
	}

}