var Scene = function(renderer, renderToElement, cellSize) {
	var me = {};
	

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();

		$(mouseInput).on('mousemove', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.ElementGhost;
				renderer.write(ElementCollection.getAsArray().concat(elm), renderToElement);
			}
		});

		$(mouseInput).on('mouseup', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.Element;
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
