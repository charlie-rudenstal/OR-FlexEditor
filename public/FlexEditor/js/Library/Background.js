var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {


    me.key = "Background";
    me.title = 'Background';
    me.description = 'Import an image you have already created from a URL';
    me.lockedX = true;
    me.lockedY = true;

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Image');
        elm.property('background', 'green');        
        elm.property('valign', 'top');
        elm.property('halign', 'left');
        elm.property('stretch', 'width');
        elm.property('text', "Background");
        elm.property('locked', false);
        elm.property('positionType', 'relative');
        elm.property('children', []);
        elm.x(0);
        elm.y(0);
        elm.width(50);
        elm.height(50);

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


    Library.elements[me.key] = me;    
})();