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
        elm.image = 'http://upload.wikimedia.org/wikipedia/commons/3/3e/Tree-256x256.png';  
        return elm;
    }

    me.key = "Sample";
    me.title = 'Image (Tree)';
    me.description = 'An image with a preset sample URL';

    Library.elements[me.key] = me;
})();