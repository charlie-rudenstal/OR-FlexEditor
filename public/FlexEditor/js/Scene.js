var Scene = function(renderer, renderToElement, size, cellSize) {
	var me = {};
	var selectedElementStartPosition;
	var selectedElementStartSize;
	var resizeDirection = 0;
	var resizeDirections = { left: 1, up: 2, right: 4, down: 8 };

	var width = size.cols * cellSize.width;
	var height = size.rows * cellSize.height;

	var $renderToElement = $(renderToElement);

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();
		registerKeyHandler();

		// Render a ghost if user is dragging an element from the library
		$(mouseInput).on('mousemove', function(e) {
			$renderToElement.css('cursor', 'default');

			if(DragDrop.current) {

				if(ElementCollection.hasGhost() == false) {
					var elm = DragDrop.current.createElement(renderToElement);
					ElementCollection.add(elm, 'ghost');
				}

				var ghost = ElementCollection.getGhost();
				
				// set a x, y, width and height using the item type default 
				// if the width is not set explicitly by the item type
				if(!DragDrop.current.lockedX) ghost.x(e.position.snapped.x - (cellSize.width * 3));
				if(!DragDrop.current.lockedY) ghost.y(e.position.snapped.y - (cellSize.height * 3));					
	
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
						if(resizeUp && resizeLeft) $renderToElement.css('cursor', 'nw-resize');
						else if(resizeUp && resizeRight) $renderToElement.css('cursor', 'ne-resize');
						else if(resizeDown && resizeLeft) $renderToElement.css('cursor', 'sw-resize');
						else if(resizeDown && resizeRight) $renderToElement.css('cursor', 'se-resize');
					
						else if(resizeLeft) $renderToElement.css('cursor', 'w-resize');
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
			var isInsideScene = e.position.absolute.x < width &&
								e.position.absolute.y < height;
			
			resizeDirection = 0;
			if(DragDrop.current) {
				if(isInsideScene) {					
					//var elm = DragDrop.current.createElement(renderToElement);
					// set a x, y, width and height using the item type default 
					// if the width is not set explicitly by the item type
					
					var elm = ElementCollection.getGhost();
					ElementCollection.convertGhostToElement();
					// if(!DragDrop.current.lockedX) elm.x(e.position.snapped.x - (cellSize.width * 3));
					// if(!DragDrop.current.lockedY) elm.y(e.position.snapped.y - (cellSize.height * 3));					

					// ElementCollection.add(elm);
					ElementCollection.select(elm);
				
				} else if (ElementCollection.hasGhost()) {
					// Render just to get rid of the ghost element if the mouse was 
					// slightly outside of the scene, but with a part of the element inside
					ElementCollection.removeGhost();
					me.render(ElementCollection.getAsArray());
				}
			}
		});

		// Select the element if the user clicks on it
		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
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
				} else {
					ElementCollection.select(element);
				}
			} else {
				ElementCollection.select(null); // Deselect elements if clicked outside
			}
		})

		// Clicks outside of the scene in the gray area should remove selection
		// (Unfortunately this area is currently also named 'scene', change this)
		$(renderToElement).closest('.sceneContainer').on('mousedown', function(e) {
			// Only catch clicks that specifically hits the area outside of the editor
			if($(e.target).is('.sceneContainer')) ElementCollection.select(null);
		});

		// Move elements if dragged
		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {
				// No resize is in progress, move the element on drag
				if(resizeDirection == 0) {
					var toX = selectedElementStartPosition.x + e.delta.snapped.x;
					var toY = selectedElementStartPosition.y + e.delta.snapped.y;
					if(selectedElement.parentElement) toX -= selectedElement.parentElement.x(null, 'absolute');
					if(selectedElement.parentElement) toY -= selectedElement.parentElement.y(null, 'absolute');
					selectedElement.x(toX, 'absolute');
					selectedElement.y(toY, 'absolute');
				} 

				// No else if:s to enable diagonal resize (when resizeDirection is up and left at the same time)
				if(resizeDirection & resizeDirections.left) {
					var toX = selectedElementStartPosition.x + e.delta.snapped.x;
					if(selectedElement.parentElement) toX -= selectedElement.parentElement.x(null, 'absolute');
					selectedElement.x(toX, 'absolute');
					selectedElement.width(selectedElementStartSize.width - e.delta.snapped.x, 'absolute');
				}
				if(resizeDirection & resizeDirections.up) {
					var toY = selectedElementStartPosition.y + e.delta.snapped.y;
					if(selectedElement.parentElement) toY -= selectedElement.parentElement.y(null, 'absolute');
					selectedElement.y(toY, 'absolute');
					selectedElement.height(selectedElementStartSize.height - e.delta.snapped.y, 'absolute');
				}
				if(resizeDirection & resizeDirections.right) {
					selectedElement.width(selectedElementStartSize.width + e.delta.snapped.x, 'absolute');
				}
				if(resizeDirection & resizeDirections.down) {
					selectedElement.height(selectedElementStartSize.height + e.delta.snapped.y, 'absolute');
				}
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
			var keyEscape = 27;
			var keyE = 69;

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

			 // ctrl + number keys: Create an element with the corresponding index from the library
			 if(e.ctrlKey && e.keyCode > 48 && e.keyCode < 58) {

				// get the element from library by index
				var libraryElementIndex = e.keyCode - 49;
				var libraryElement = null;
				var i = 0;
				for(var key in Library.elements) {
					if(i++ == libraryElementIndex) libraryElement = Library.elements[key];
				}
				if(!libraryElement) return;
				var elm = libraryElement.createElement(renderToElement);
				if(isNaN(elm.width())) elm.width(4 * cellSize.width);
				if(isNaN(elm.height())) elm.height(4 * cellSize.height);
				if(isNaN(elm.x())) elm.x((~~(size.cols / 2) - 2) * cellSize.width);
				if(isNaN(elm.y())) elm.y((~~(size.rows / 2) - 2) * cellSize.height);					
				ElementCollection.add(elm);
				ElementCollection.select(elm);
			}

			// alt + e will print an array of the current Elements to the console
			if(e.altKey && e.keyCode == keyE) {
				console.log(ElementCollection.getAsArray());
			}

			// escape: Remove current selection
			if(e.keyCode == keyEscape) {
				ElementCollection.select(null);
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
			if(domElement.id == 'element_' + elements[i].property("id")) {
				// Elements that are locked should not be selectable
				if(!elements[i].property('locked')) return elements[i];
			}
		}
	}

	return me;
}
