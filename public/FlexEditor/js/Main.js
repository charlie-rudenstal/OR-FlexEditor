function Main(options) {
	var me = this;
	var elements = [];
	var selectedElement = null;
	var selectedElementStartPosition;

	// Set options
	options = options || {};
	var elmEditor = $(options.element).get(0);
	var cellSize = options.cellSize || { width: 5, height: 5 };
	var width = options.width || 12;
	var height = options.height || 25;

	// Resize the editor element to match the size specified in options
	elmEditor.style.width = width * cellSize.width + 'px';
	elmEditor.style.height = height * cellSize.height + 'px';

	// Initialize modules 
	var interactions = new Interactions();
	var renderer = new Renderer();
	var grid = new Grid(renderer, { cellSize: cellSize, width: width, height: height });
	var library = new Library(renderer);
	var layers = new Layers(renderer);

	$(ElementCollection).on('change', function() { me.render(); });

	me.load = function() {

		var mouseInput = new MouseInput(elmEditor, cellSize);
		mouseInput.start();

		$(mouseInput).on('mousemove', function(e) {
			if(DragDrop.current) {
				var elm = new Element(elmEditor);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.ElementGhost;
				renderer.write(ElementCollection.getAsArray().concat(elm), elmEditor);
			}
		});

		$(mouseInput).on('mouseup', function(e) {
			if(DragDrop.current) {
				var elm = new Element(elmEditor);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.Element;
				ElementCollection.select(elm);
				me.addElement(elm);
			}
		});

		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
			ElementCollection.select(element);
			selectedElementStartPosition = { x: element.x(), y: element.y() };
		})

		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {
				selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x);
				selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y);
				me.render();
			}
		});

	};

	me.addElement = function(elm) {
		ElementCollection.add(elm);
		me.render();
		$(me).trigger('change');
	}

	me.render = function() {
		var elements = ElementCollection.getAsArray();
		renderer.write(elements, elmEditor);
		layers.render(elements);
	}

	function getElementByDomElement(domElement) {
		if(!domElement) return;
		var elements = ElementCollection.getAsArray(); 
		for(var i in elements) {
			if(domElement.id == 'element_' + elements[i].id) return elements[i];
		}
	}

	// Render the grid
	me.grid = function(element) {
		grid.render(element);
	}

	me.library = function(element) {
		library.load(element);
	}

	me.layers = function(element) {
		layers.load(element);
	}

	function getElementsAtPosition(position) {
		var elementsAtPosition = [];
		for(var i in elements) {
			var elm = elements[i];
			var isWithinHorizontal = (position.x >= elm.x() && position.x < elm.x() + elm.width());
			var isWithinVertical = (position.y >= elm.y() && position.y < elm.y() + elm.height());
			if(isWithinVertical && isWithinHorizontal) { 
				elementsAtPosition.push(elm);
			}
		}
		return null;
	}

	// me.import = function(newButtonData) {
	// 	buttons = [];
	// 	for(var i in newButtonData) {
	// 		buttons.push(new Button(elmEditor, newButtonData[i]));
	// 	}
	// 	me.render();
	// }

	// me.getExport = function() {
	// 	var arr = [];
	// 	for(var i in buttons) {
	// 		arr.push(buttons[i].getExport());
	// 	}
	// 	return arr;
	// };
};

