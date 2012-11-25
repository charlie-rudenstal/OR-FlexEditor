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

	var size = { cols: options.width || 12,
				 rows: options.height || 25 };

	// Resize the editor element to match the size specified in options
	elmEditor.style.width = size.cols * cellSize.width + 'px';
	elmEditor.style.height = size.rows * cellSize.height + 'px';

	// Initialize modules 
	var interactions = new Interactions();
	var renderer = new Renderer();
	var grid = new Grid(renderer, { cellSize: cellSize, size: size });
	var library = new Library(renderer);
	var layers = new Layers(renderer);
	var scene = new Scene(renderer, elmEditor, size, cellSize);

	ElementCollection.setCellSize(cellSize);
	$(ElementCollection).on('layoutInvalidated', function() { me.invalidateLayout() });
	$(ElementCollection).on('selection', function(e) {
		var element = e.element;	
		if(element) {
			PropertyPanel.show(element, renderer, document.body, 190, 47);
		} else {
			PropertyPanel.closeAll();
		}
	});

	me.load = function() {
		scene.init();

		// Add the default Background layer
        var elm = Library.elements.Background.createElement(elmEditor);
        ElementCollection.add(elm);
	};

	me.invalidateLayout = function() {
		me.render();
	}
 
	me.render = function() {
		var elements = ElementCollection.getAsArray();
		var rootElements = ElementCollection.getRootChildrenAsArray();
		scene.render(rootElements);
		layers.render(elements);
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

