var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Image');  
        elm.property('background', 'transparent');  
        elm.property('valign', 'top');  
        elm.property('halign', 'left');  
        elm.property('stretch', 'width');
        elm.width(4, 'cells');
        elm.height(4, 'cells');
        return elm;
    }

    me.key = "Image";
	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';

    Library.elements[me.key] = me;    
})();