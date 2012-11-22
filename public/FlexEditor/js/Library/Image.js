var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    var autosizeChangeInProgress = false;

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Image');  
        elm.property('background', 'transparent');  
        elm.property('valign', 'top');  
        elm.property('halign', 'left');  
        elm.property('stretch', 'width');
        elm.width(4, 'cells');
        elm.height(4, 'cells');
        elm.property('autosize', false);

        $(elm).on('imageChange', onImageChange);
        $(elm).on('autosizeChange', onAutosizeChanged);
        $(elm).on('widthChange heightChange', onSizeChange);
        elm.property('autosize', true);

        return elm;
    }


    // http://www.apicasystem.com/portals/0/Partners/Microsoft_Logo.png

    // Autosize functionality
    
    function onImageChange(e) {
        if(e.target.property('autosize')) onAutosizeChanged(e);
    }

    function onAutosizeChanged(e) {
        console.log("yeah");
        var elm = e.target;
        if(elm.property('autosize') == true && elm.property('image')) {        
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

    me.key = "Image";
	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';

    Library.elements[me.key] = me;    
})();