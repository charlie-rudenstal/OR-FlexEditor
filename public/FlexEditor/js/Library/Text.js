var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {
	function me() {

    }

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.property('contentType', 'Text');  
        elm.property('padding', 0); 
        elm.property('valign', 'top');  
        elm.property('halign', 'left');
        elm.property('background', 'transparent');
        elm.property('foreground', 'white');
        elm.property('padding', 0);
        elm.property('text', '');
        return elm;
    }
    
    me.key = "Text";
	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';
    me.width = 6;
    me.height = 2;

    Library.elements[me.key] = me;
})();