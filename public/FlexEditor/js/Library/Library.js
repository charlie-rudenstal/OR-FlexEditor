function Library(renderer) {

	var element;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		element = elementContainer;
		
		var mouseInput = new MouseInput(element, null, true);
		mouseInput.start();

		$(mouseInput).on('mousedown', onItemDown);
		$(mouseInput).on('drag', onItemDragged);
		$(mouseInput).on('mouseup', onItemUp);

		render();
	}

	function onItemDown(e) {

	}

	function onItemDragged(e) {
		var libraryElementTitle = $(e.target).closest('.library-element').data('title');
		if(!libraryElementTitle) return;

		var libraryElement = Library.elements[libraryElementTitle];

		if($('.library-ghost').size() == 0) {
			var $ghost = $(renderer.render(libraryElement, Templates.LibraryGhost));
			$ghost.appendTo('body');
		}

		var $ghost = $('.library-ghost');
		$ghost.css('left', e.position.absolute.x + 14);
		$ghost.css('top', e.position.absolute.y - 2);
	}

	function onItemUp(e) {
		console.log("up");
		$('.ghost').remove();
	}

	function render() {
		// Library.Elements is an object with items like Library.Elements.Text for easy access,
		// we need to convert it into a true array before rendering the items
		var elementsArray = [];
		for(var i in Library.elements) elementsArray.push(Library.elements[i]);
		renderer.write(elementsArray, element, Templates.LibraryElement);
	}

}