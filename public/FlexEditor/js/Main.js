function Main(options) {
	var me = this;
	options = options || {};
	
	var elmEditor = $(options.element).get(0);
	var cellSize = options.cellSize || { width: 5, height: 5 };
	var buttons = options.buttons || [];
	
	var interactions = new Interactions();
	var renderer = new Renderer();
	var grid = new Grid(renderer, cellSize);

	me.load = function() {
		
		var mouseInput = new MouseInput(elmEditor, cellSize);
		mouseInput.start();

		$(mouseInput).on('mousedown mouseup drag', function(e) {
			console.log(e.type, e.position.absolute, e.delta && e.delta.absolute);
		});

		// mouseInput.register({
		// 	  element: elmEditor
		// 	, cellSize: cellSize 
		// 	, onMouseUp: eventHandler(onEvent,   { event: 'mouseUp' })
		// 	, onMouseDown: eventHandler(onEvent, { event: 'mouseDown' })
		// 	, onMouseMove: eventHandler(onEvent, { event: 'mouseMove' })
		// 	, onDoubleClick: eventHandler(onEvent, { event: 'doubleClick' })
		// });

	}

	me.grid = function(element) {
		grid.render(element);
	}

	me.getExport = function() {
		var arr = [];
		for(var i in buttons) {
			arr.push(buttons[i].getExport());
		}
		return arr;
	};

	me.import = function(newButtonData) {
		buttons = [];
		for(var i in newButtonData) {
			buttons.push(new Button(elmEditor, newButtonData[i]));
		}
		renderer.write(Templates.Button, buttons);	
	}
};

