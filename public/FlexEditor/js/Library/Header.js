var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    function me() {
        
    }

    me.createElement = function(renderToElement) {
        var elm = new Element(renderToElement);
        elm.template = Templates.Element;
        elm.contentType('Text');
        // elm.background = '-webkit-linear-gradient(#595959, #2D2D2D)';        
        elm.background = '-webkit-linear-gradient(top, #333333 0%, #303030 50%, #292929 51%, #202020 100%);';        
        elm.foreground = 'white';
        elm.text = 'Header';
        elm.valign = 'middle';
        elm.halign = 'center'; 
        elm.positionType = 'relative';
        elm.padding = 0;

        elm.x(0, 'relative');
        elm.y(0, 'relative');
        elm.width(100, 'relative');

        return elm;
    }

    me.key = "Header";
    me.title = 'Header';
    me.description = 'A predefined Titlebar';
    me.width = 20;
    me.height = 3;

    Library.elements[me.key] = me;
})();