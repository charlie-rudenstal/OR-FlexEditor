function Library(renderer) {
	this.renderer = renderer;
}

(function(me) {

	me.prototype.render = function(element) {
		// The renderer work on pure elements not wrapped by jQuery
		if(element instanceof jQuery) element = element.get(0);

		// Library.Elements is an object with items like Library.Elements.Text for easy access,
		// we need to convert it into a true array before rendering the items
		var elementsArray = [];
		for(var i in Library.elements) elementsArray.push(Library.elements[i]);

		this.renderer.write(elementsArray, element, Templates.LibraryElement);
	}


})(Library);