var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    function me() {
        
    }

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Text');
        elm.property('background', '-webkit-linear-gradient(top, #333333 0%, #303030 50%, #292929 51%, #202020 100%);');
        elm.property('foreground', 'white');
        elm.property('text', 'Header');
        elm.property('valign', 'middle');
        elm.property('halign', 'center');
        elm.property('positionType', 'relative');
        elm.property('padding', '0');

        elm.x(0, 'relative');
        elm.y(0, 'relative');
        elm.width(100, 'relative');
        elm.height(3, 'cells');
        return elm;
    }

    me.key = "Header";
    me.title = 'Header';
    me.description = 'A predefined Titlebar';

    me.lockedX = true;
    me.lockedY = true;

    Library.elements[me.key] = me;
})();