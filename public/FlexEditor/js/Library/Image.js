var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    me.key = "Image";
    me.title = 'Image';
    me.description = 'Import an image you have already created from a URL';

	function me() {
		
	}

    me.createElement = function() {
        // var elm = ElementCollection.create(renderToElement);
        // elm.property('contentType', 'Image');  
        // elm.property('background', 'transparent');  
        // elm.property('valign', 'top');  
        // elm.property('halign', 'left');  
        // elm.property('stretch', 'width');
        // elm.width(4, 'cells');
        // elm.height(4, 'cells');
        // elm.property('autosize', false);

        // $(elm).on('imageChange', onImageChange);
        // $(elm).on('autosizeChange', onAutosizeChanged);
        // $(elm).on('widthChange heightChange', onSizeChange);
        // elm.property('autosize', true);

        var elm = ElementCollection.create();
        elm.property('contentType', 'Image');
        elm.property('background', 'transparent');        
        elm.property('valign', 'top');
        elm.property('halign', 'left');
        elm.property('stretch', 'width');
        elm.property('text', "Image");
        elm.property('locked', false);
        elm.property('x', 0);
        elm.property('y', 0);
        elm.property('positionType', 'relative');
        elm.property('centerx', false);
        elm.property('centery', false);
        elm.property('width', 40);
        elm.property('height', 40);

        $(elm).on('imageChange', onImageChange);
        $(elm).on('autosizeChange', onAutosizeChanged);
        $(elm).on('widthChange heightChange', onSizeChange);
        elm.property('autosize', true);

        return elm;
    }


    //////////////////
    //// Autosize ////
    //////////////////
    var autosizeChangeInProgress = false;
    function onImageChange(e) {
        if(e.target.property('autosize')) onAutosizeChanged(e);
    }

    function onAutosizeChanged(e) {
        var elm = e.target;
        if(elm.property('autosize') == true && elm.property('image')) {        
            // Update this element to get the width and height of the true image
            var img = new Image();
            img.onload = function() {
                autosizeChangeInProgress = true;
                elm.property('positionType', 'absolute');
                elm.property('width', this.width);
                elm.property('height', this.height);
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

    Library.elements[me.key] = me;    
})();