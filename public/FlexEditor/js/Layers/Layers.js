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
		var $target = $(e.target);
		var element = ElementCollection.getFromDom(e.target);

		if($target.is('.layer-element')) {
			ElementCollection.select(element);
		} else if($target.closest('.attribute-locked').length > 0) {
			element.toggleProperty('locked');
		} else if($target.closest('.attribute-position').length > 0) {
				
			var cell = element.getCell();

			console.log(cell);

			element.property('positionType', (element.property('positionType') == 'absolute') 
				? 'relative' 
				: 'absolute');

			element.setX(cell.x);
			element.setY(cell.y);
			element.setWidth(cell.width);
			element.setHeight(cell.height);
		}
	}

	// Will switch selection between elements with Shift+Up and Shift+Down
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyDown = 40;
			var keyUp = 38;
			var keyD = 68;

			// shift + up/down will move elemnt selection up and down 
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

			// alt + d will duplicate current element
			if(e.altKey && !e.shiftKey && e.keyCode == keyD) {
				var selectedElement = ElementCollection.getSelected();
				var duplicateElement = ElementCollection.create(selectedElement.getParent(), selectedElement.getProperties());
				
				duplicateElement.width(selectedElement.width(null, 'relative'), 'relative');
				duplicateElement.height(selectedElement.height(null, 'relative'), 'relative');
				duplicateElement.x(selectedElement.x(null, 'relative'), 'relative');
				duplicateElement.y(selectedElement.y(null, 'relative'), 'relative');

				// Otherwise the new element will inherit the id from the old dupliate
				// This is not automatically done in ElementColletion.create
				// because it might be useful to craete an element with a specific ID, 
				// for example when importing an existing view
				duplicateElement.generateNewId(); 
				
				ElementCollection.add(duplicateElement);
				ElementCollection.select(duplicateElement);
			}
		});
	}

	this.render = function(elements) {
		loadedElements = cloneArrayShallow(elements);
		//loadedElements.reverse(); // reverse our copy to get latest layer at top
		//loadedElements.reverse();

		var renderElements = getLayerLevel(loadedElements, null, 0);
		
		renderer.write(renderElements, renderToElement, Templates.Layer, true, true);
		
		loadedElements = renderElements;
	}

	function getLayerLevel(elements, parent, layerIndent) {
		var renderElements = [];

		// loop through all root elements reversed to get latest layer at top
		for(var i = elements.length - 1; i > -1; i--) {
			var elm = elements[i];

			// don't show ghosts in the list
			if(elm == ElementCollection.getGhost()) continue;

			// only render children with current parent
			if(elm.parentElement != parent) continue;

			// give element a layerLevel for indentation
			elm.layerIndent = layerIndent;

			renderElements.push(elm);

			// find children of this element and render if any
			var children = elm.property('children');
			if(children) { 
				var rendererdChildren = getLayerLevel(children, elm, layerIndent + 1);
				renderElements = renderElements.concat(rendererdChildren);
			}
		}
		return renderElements;
	}

}