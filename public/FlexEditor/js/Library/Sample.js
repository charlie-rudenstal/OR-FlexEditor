var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    var autosizeChangeInProgress = false;

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

        $(elm).on('autosizeChange', onAutosizeChanged);
        $(elm).on('widthChange heightChange', onSizeChange);
        elm.property('autosize', true);

        return elm;
    }

    function onAutosizeChanged(e) {
        var elm = e.target;
        if(elm.property('autosize') == true) {        
            // Update this element to get the width and height of the true image
            var img = new Image();
            img.onload = function() {
                autosizeChangeInProgress = true;
                elm.width(this.width, 'absolute');
                elm.height(this.height, 'absolute');
                autosizeChangeInProgress = false;
            }
            img.src = elm.property('image');
        }
    }    

    // Turn off autosize if the user changes the width or height of the
    // element manually. Check that the change is not triggered by autosize itself
    function onSizeChange(e) {
        if(autosizeChangeInProgress) return;
        e.target.property('autosize', false);
    }

    me.key = "Sample";
    me.title = 'Image (Tree)';
    me.description = 'An image with a preset sample URL';
    
    Library.elements[me.key] = me;
})();