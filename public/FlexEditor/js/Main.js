function Main(options) {
	var me = this;
	var elements = [];

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

	me.load = function() {

		var mouseInput = new MouseInput(elmEditor, cellSize);
		mouseInput.start();

		$(mouseInput).on('drag', function(e) {
			var elm = new Element(elmEditor);
			elm.x(e.positionStart.snapped.x);
			elm.y(e.positionStart.snapped.y);
			elm.width(e.delta.snapped.x);
			elm.height(e.delta.snapped.y);
			renderer.write(elm, elmEditor);
		});

	};

	me.render = function() {
		renderer.write(elements, elmEditor);
	}

	// Render the grid
	me.grid = function(element) {
		//grid.render(element);
	}

	me.library = function(element) {
		library.render(element);
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

	me.import = function(newButtonData) {
		buttons = [];
		for(var i in newButtonData) {
			buttons.push(new Button(elmEditor, newButtonData[i]));
		}
		renderer.write(Templates.Button, buttons);	
	}

	me.getExport = function() {
		var arr = [];
		for(var i in buttons) {
			arr.push(buttons[i].getExport());
		}
		return arr;
	};
};

