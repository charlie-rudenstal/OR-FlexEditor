function Library(renderer) {

	var element;
	var $ghostLibraryElement;
	var ghostLibraryElement;
	var ghostStartPosition;

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
		$ghostLibraryElement = $(e.target).closest('.library-element');
		ghostLibraryElement = Library.elements[$ghostLibraryElement.data('title')];
		ghostStartPosition = $ghostLibraryElement.offset();

		DragDrop.current = ghostLibraryElement;
	}

	function onItemDragged(e) {
		if($('.library-ghost').size() == 0) {
			var $ghost = $(renderer.render(ghostLibraryElement, Templates.LibraryGhost));
			$ghost.appendTo('body');
		}

		var $ghost = $('.library-ghost');

		$ghost.css('left', ghostStartPosition.left + e.delta.absolute.x);
		$ghost.css('top', ghostStartPosition.top + e.delta.absolute.y);
	}

	function onItemUp(e) {
		$('.library-ghost').remove();
		
		// set timeout to let listeners of mouseup retrieve the dragdrop data before it's cleared
		setTimeout(function() {
			DragDrop.current = null;
		}, 0);
	}

	function render() {
		// Library.Elements is an object with items like Library.Elements.Text for easy access,
		// we need to convert it into a true array before rendering the items
		var elementsArray = [];
		for(var i in Library.elements) elementsArray.push(Library.elements[i]);
		renderer.write(elementsArray, element, Templates.LibraryElement);
	}

}