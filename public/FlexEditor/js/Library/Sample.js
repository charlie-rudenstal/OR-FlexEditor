var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    function me() {
        
    }

    me.createElement = function(parent) {
        var elm = ElementCollection.create(parent);
        elm.property('contentType', 'Image');
        elm.property('background', 'transparent');
        elm.property('valign', 'top');
        elm.property('halign', 'left');
        elm.property('image', 'http://upload.wikimedia.org/wikipedia/commons/3/3e/Tree-256x256.png');  
        elm.property('stretch', 'width');
        elm.width(10, 'cells');
        elm.height(10, 'cells');
        return elm;
    }

    me.key = "Sample";
    me.title = 'Image (Tree)';
    me.description = 'An image with a preset sample URL';
    
    Library.elements[me.key] = me;
})();