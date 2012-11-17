var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {
	function me() {

    }

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.template = Templates.Element;
        elm.contentType('Text');  
        return elm;
    }
    
    me.key = "Text";
	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';

    Library.elements[me.key] = me;
})();