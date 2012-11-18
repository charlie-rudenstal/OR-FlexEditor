var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.property('contentType', 'Image');  
        elm.property('background', 'transparent');  
        elm.property('valign', 'top');  
        elm.property('halign', 'left');  
        elm.property('stretch', 'width');
        return elm;
    }

    me.key = "Image";
	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';
    me.width = 6;
    me.height = 6;

    Library.elements[me.key] = me;    
})();