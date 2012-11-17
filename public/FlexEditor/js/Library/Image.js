var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.template = Templates.Element;
        elm.contentType('Image');  
        elm.background = 'transparent';  
        elm.valign = 'top';  
        elm.halign = 'left';  
        elm.stretch = 'width';
        return elm;
    }

    me.key = "Image";
	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';

    Library.elements[me.key] = me;    
})();