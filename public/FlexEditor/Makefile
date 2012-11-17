output = bin
src = js
css = css

start = 	$(src)/Helpers/_start.js
end =		$(src)/Helpers/_end.js
			
files = 	$(src)/Main.js\
	 	 	$(src)/Helpers/Helpers.js\
			$(src)/Interactions.js\
			$(src)/MouseInput.js\
			$(src)/Renderer.js\
			$(src)/Templates.js\
			$(src)/Grid/Grid.js\
			$(src)/DragDrop.js\
			$(src)/ElementCollection.js\
			$(src)/Scene.js\
			$(src)/Element/Element.js\
			$(src)/Layers/Layers.js\
			$(src)/PropertyPanel/PropertyPanel.js\
			$(src)/Library/Library.js\
			$(src)/Library/Text.js\
			$(src)/Library/Image.js\
			$(src)/Library/Sample.js
			
templates = $(src)/Element/element.tpl\
			$(src)/Element/element.selected.tpl\
			$(src)/Element/element.ghost.tpl\
			$(src)/Element/element.type.text.tpl\
			$(src)/Element/element.type.image.tpl\
			$(src)/PropertyPanel/properties.text.tpl\
			$(src)/PropertyPanel/properties.image.tpl\
 		    $(src)/Grid/grid.tpl\
 		    $(src)/Layers/layer.tpl\
 		    $(src)/Library/library.element.tpl\
 		    $(src)/Library/library.ghost.tpl

cssFiles = 	$(css)/Base.css\
			$(css)/Editor.css\
			$(css)/Grid.css\
			$(css)/Library.css\
			$(css)/Layers.css\
			$(css)/PropertyPanel.css\
			$(css)/Component.css\
			$(css)/Adorner.Resize.css

FlexEditortarget.js: ${files}

	# Add the function wrapper
	cat ${start} > $(output)/FlexEditor.js

	# Append the modules
	cat ${files} >> $(output)/FlexEditor.js

	# HTML Templates (remove newlines to support multiline strings in source)
	cat ${templates} | tr -d "\n" >> $(output)/FlexEditor.js
	
	# And finally exposing public objects
	cat ${end} >> $(output)/FlexEditor.js

FlexEditortarget.css: ${cssFiles}

	# Merge CSS files
	cat $(cssFiles) > $(output)/FlexEditor.css


watch:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while true ; do \
		inotifywait -qqr src; \
		$(MAKE) -s; \
	done

watchmac:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while kqwait src; do \
		echo build \
		$(MAKE) -s; \
	done	

.PHONY: watch, FlexEditortarget.js
.SILENT: watch, FlexEditortarget.js FlexEditortarget.css

