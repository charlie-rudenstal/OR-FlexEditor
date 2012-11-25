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
				if(!DragDrop.current.lockedX) ghost.setX(e.position.snapped.x - 2);
				if(!DragDrop.current.lockedY) ghost.setY(e.position.snapped.y - 3);					

			} else {
				
				// Check if mouse is over a resize handle and update the mouse pointer accordingly
				var element = ElementCollection.getFromDom(e.target);
				if(element && element.selected) {
					var absElement = element.getAbsolute();
					
					var relativeX = e.position.absolute.x - absElement.x;
					var relativeY = e.position.absolute.y - absElement.y;

					var resizeLeft = relativeX < 8;
					var resizeUp = relativeY < 8;
					var resizeRight = relativeX >= absElement.width - 8;
					var resizeDown = relativeY >= absElement.height - 8;

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
					// set a x, y, width and height using the item type default 
					// if the width is not set explicitly by the item type
					var elm = ElementCollection.getGhost();
					ElementCollection.convertGhostToElement();
					
					// If an element was selected when this element
					// is created, it should be added as a child to this element
					var parentElement = ElementCollection.getSelected();
					if(parentElement) {
						var children = parentElement.property('children');
						if(children) {
							children.push(elm);
							elm.parentElement = parentElement;
						}
					}
					// ElementCollection.add(elm);
					ElementCollection.select(elm);
				
				} else if (ElementCollection.hasGhost()) {
					// Render just to get rid of the ghost element if the mouse was 
					// slightly outside of the scene, but with a part of the element inside
					ElementCollection.removeGhost();
					me.render(ElementCollection.getRootChildrenAsArray());
				}
			}
		});

		// Select the element if the user clicks on it
		$(mouseInput).on('mousedown', function(e) {
			var element = ElementCollection.getFromDom($(e.target));
			if(element) {
				// Save the position of the element
				// selectedElementStartPosition = { x: elmAbsolute.x, y: elmAbsolute.y };
				// selectedElementStartSize = { width: elmAbsolute.width, height: elmAbsolute.height };
				
				selectedElementStartPosition = element.getCell();
				
				if(element.selected) {
					
					var elmAbsolute = element.getAbsolute();
					
					// Did the user click on a resize handle?
					var relativeX = e.position.absolute.x - elmAbsolute.x;
					var relativeY = e.position.absolute.y - elmAbsolute.y;

					var resizeLeft = relativeX < 8;
					var resizeUp = relativeY < 8;
					var resizeRight = relativeX >= elmAbsolute.width - 8;
					var resizeDown = relativeY >= elmAbsolute.height - 8;
					
					resizeDirection = 0;
					if(resizeLeft) resizeDirection |= resizeDirections.left;
					if(resizeUp) resizeDirection |= resizeDirections.up;
					if(resizeRight) resizeDirection |= resizeDirections.right;
					if(resizeDown) resizeDirection |= resizeDirections.down;

				} else {
					ElementCollection.select(element);
				}
			} else {
				// Deselect elements if user clicked on something else than an element
				ElementCollection.select(null); 
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
				var isResizing = resizeDirection > 0;
				if(isResizing) {	
					// No else if:s to enable diagonal resize (when resizeDirection is up and left at the same time)
					if(resizeDirection & resizeDirections.left) {
						var toX = selectedElementStartPosition.x + e.delta.snapped.x;
						var toWidth = selectedElementStartPosition.width - e.delta.snapped.x;
						selectedElement.setX(toX);
						selectedElement.setWidth(toWidth);
					}
					if(resizeDirection & resizeDirections.up) {
						var toY = selectedElementStartPosition.y + e.delta.snapped.y;
						var toHeight = selectedElementStartPosition.height - e.delta.snapped.y;
						selectedElement.setY(toY);
						selectedElement.setHeight(toHeight);
					}
					if(resizeDirection & resizeDirections.right) {
						var toWidth = selectedElementStartPosition.width + e.delta.snapped.x;
						selectedElement.setWidth(toWidth);
					}
					if(resizeDirection & resizeDirections.down) {
						var toHeight = selectedElementStartPosition.height + e.delta.snapped.y;
						selectedElement.setHeight(toHeight);
					}
				} else {
					// No resize is in progress, move the element on drag
					var toX = selectedElementStartPosition.x + e.delta.snapped.x;
					var toY = selectedElementStartPosition.y + e.delta.snapped.y;
					selectedElement.setX(toX);
					selectedElement.setY(toY);
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
				// Find which element is selected and ignore if no selection, then resize it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.resize(-1, 0);
				if(e.keyCode == keyUp) 		selectedElement.resize(0, -1);
				if(e.keyCode == keyRight) 	selectedElement.resize(1, 0);
				if(e.keyCode == keyDown) 	selectedElement.resize(0, 1);
			}

			// alt + arrows: Move current Element
			if(e.altKey && !e.shiftKey) {
				// Find which element is selected and ignore if no selection, then move it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.move(-1, 0);
				if(e.keyCode == keyUp) 		selectedElement.move(0, -1);
				if(e.keyCode == keyRight) 	selectedElement.move(1, 0);
				if(e.keyCode == keyDown) 	selectedElement.move(0, 1);
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
