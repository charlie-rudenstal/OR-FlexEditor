var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {
	function me() {

    }

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Text');  
        elm.property('padding', 0); 
        elm.property('valign', 'top');  
        elm.property('halign', 'left');
        elm.property('background', 'transparent');
        elm.property('foreground', 'white');
        elm.property('padding', 0);
        elm.property('text', '');
        elm.width(6, 'cells');
        elm.height(2, 'cells');
        return elm;
    }
    
    me.key = "Text";
	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';

    Library.elements[me.key] = me;
})();