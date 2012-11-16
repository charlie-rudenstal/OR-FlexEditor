var Scene = function(renderer, renderToElement, cellSize) {
	var me = {};
	

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();
		registerKeyHandler();

		$(mouseInput).on('mousemove', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.template = Templates.ElementGhost;
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				renderer.write(ElementCollection.getAsArray().concat(elm), renderToElement);
			}
		});

		$(mouseInput).on('mouseup', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.template = Templates.Element;
				console.log(elm);
				elm.contentType(DragDrop.current.title);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				ElementCollection.add(elm);
				ElementCollection.select(elm);
			}
		});

		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
			ElementCollection.select(element);
			if(element) {
				selectedElementStartPosition = { x: element.x(), y: element.y() };
			}
		})

		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {
				selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x);
				selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y);
				me.render(ElementCollection.getAsArray());
			}
		});
	};

	// Will move elements when using Alt + Arrow keys
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyLeft = 	37;
			var keyUp = 38;
			var keyRight = 39;
			var keyDown = 40;
			if(e.altKey) {
				// Find which element is selected and ignore if no selection
				// Then move it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.x(selectedElement.x() - cellSize.width);
				if(e.keyCode == keyUp) 		selectedElement.y(selectedElement.y() - cellSize.height);
				if(e.keyCode == keyRight) 	selectedElement.x(selectedElement.x() + cellSize.width);
				if(e.keyCode == keyDown) 	selectedElement.y(selectedElement.y() + cellSize.height);
				selectedElement.invalidate();
			}
		});
	}

	me.render = function(elements) {
		renderer.write(elements, renderToElement);
	}

	function getElementByDomElement(domElement) {
		if(!domElement) return;
		var elements = ElementCollection.getAsArray(); 
		for(var i in elements) {
			if(domElement.id == 'element_' + elements[i].id) return elements[i];
		}
	}

	return me;
}
