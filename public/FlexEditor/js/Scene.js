var Scene = function(renderer, renderToElement, size, cellSize) {
	var me = {};
	var selectedElementStartPosition;
	var selectedElementStartSize;
	var resizeDirection = 0;
	var resizeDirections = { left: 1, up: 2, right: 4, down: 8 };

	var $renderToElement = $(renderToElement);

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();
		registerKeyHandler();

		// Render a ghost if user is dragging an element from the library
		$(mouseInput).on('mousemove', function(e) {

			$renderToElement.css('cursor', 'default');

			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.template = Templates.ElementGhost;
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				renderer.write(ElementCollection.getAsArray().concat(elm), renderToElement);
			
			} else {

				// Check if mouse is over a resize handle and update the mouse pointer accordingly
				var domElement = $(e.target).closest('.component').get(0);
				var element = getElementByDomElement(domElement);
				if(element && element.selected) {
					var relativeX = e.position.absolute.x - element.x();
					var relativeY = e.position.absolute.y - element.y();
					var resizeLeft = relativeX < 8;
					var resizeUp = relativeY < 8;
					var resizeRight = relativeX >= element.width() - 8;
					var resizeDown = relativeY >= element.height() - 8;

					if(element.selected) {
						if(resizeLeft) $renderToElement.css('cursor', 'w-resize');
						else if(resizeUp) $renderToElement.css('cursor', 'n-resize');
						else if(resizeRight) $renderToElement.css('cursor', 'e-resize');
						else if(resizeDown) $renderToElement.css('cursor', 's-resize');
						else $renderToElement.css('cursor', 'default');
					} else {
						ElementCollection.select(element);
					} 
				}
			}

		});


		// If a element from the library is dropped over the scene, then create it
		$(mouseInput).on('mouseup', function(e) {
			var isInsideScene = e.position.absolute.x < size.width &&
								e.position.absolute.y < size.height;
			
			resizeDirection = 0;
			if(DragDrop.current) {
				if(isInsideScene) {
					var elm = new Element(renderToElement);
					elm.template = Templates.Element;
					elm.contentType(DragDrop.current.title);
					elm.x(e.position.snapped.x - (cellSize.width * 3));
					elm.y(e.position.snapped.y - (cellSize.height * 3));
					elm.width(cellSize.width * 6);
					elm.height(cellSize.height * 6);
					ElementCollection.add(elm);
					ElementCollection.select(elm);
				} else {
					// Render just to get rid of the ghost element if the mouse was 
					// slightly outside of the scene, but with a part of the element inside
					me.render(ElementCollection.getAsArray());
				}
			}
		});

		// Select the element if the user clicks on it
		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
			console.log(element);
			if(element) {
				var relativeX = e.position.absolute.x - element.x();
				var relativeY = e.position.absolute.y - element.y();
				
				var resizeLeft = relativeX < 8;
				var resizeUp = relativeY < 8;
				var resizeRight = relativeX >= element.width() - 8;
				var resizeDown = relativeY >= element.height() - 8;
				
				selectedElementStartPosition = { x: element.x(), y: element.y() };
				selectedElementStartSize = { width: element.width(), height: element.height() };

				resizeDirection = 0;
				if(element.selected) {
					// Did the user click on a resize handle?
					if(resizeLeft) resizeDirection |= resizeDirections.left;
					if(resizeUp) resizeDirection |= resizeDirections.up;
					if(resizeRight) resizeDirection |= resizeDirections.right;
					if(resizeDown) resizeDirection |= resizeDirections.down;
					console.log(resizeDirection);
				} else {
					ElementCollection.select(element);
				}
			} else {
				ElementCollection.select(null); // Deselect elements if clicked outside
			}
		})

		// Move elements if dragged
		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {

				// No resize is in progress, move the element on drag
				if(resizeDirection == 0) {
					selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x);
					selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y);
				} 

				// No else if:s to enable diagonal resize (when resizeDirection is up and left at the same time)
				if(resizeDirection & resizeDirections.left) {
					selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x);
					selectedElement.width(selectedElementStartSize.width - e.delta.snapped.x);
				}
				if(resizeDirection & resizeDirections.up) {
					selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y);
					selectedElement.height(selectedElementStartSize.height - e.delta.snapped.y);
				}
				if(resizeDirection & resizeDirections.right) {
					selectedElement.width(selectedElementStartSize.width + e.delta.snapped.x);
				}
				if(resizeDirection & resizeDirections.down) {
					selectedElement.height(selectedElementStartSize.height + e.delta.snapped.y);
				}

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

			// alt + shift + arrows: Resize current Element
			if(e.altKey && e.shiftKey) {
				// Find which element is selected and ignore if no selection
				// Then resize it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.width(selectedElement.width() - cellSize.width);
				if(e.keyCode == keyUp) 		selectedElement.height(selectedElement.height() - cellSize.height);
				if(e.keyCode == keyRight) 	selectedElement.width(selectedElement.width() + cellSize.width);
				if(e.keyCode == keyDown) 	selectedElement.height(selectedElement.height() + cellSize.height);
				selectedElement.invalidate();
			}

			// alt + arrows: Move current Element
			if(e.altKey && !e.shiftKey) {
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
