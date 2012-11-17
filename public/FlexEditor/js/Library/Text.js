var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {
	function me() {

    }

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.template = Templates.Element;
        elm.contentType('Text');  
        elm.padding = 0; 
        elm.valign = 'top';  
        elm.halign = 'left'; 
        elm.background = 'transparent;'
        elm.padding = 6;
        elm.locked = true;
        return elm;
    }
    
    me.key = "Text";
	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';
    me.width = 6;
    me.height = 2;

    Library.elements[me.key] = me;
})();