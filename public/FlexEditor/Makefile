output = bin
src = js
css = css

start = 	$(src)/_start.js
end =		$(src)/_end.js
			
files = 	$(src)/Main.js\
	 	 	$(src)/Helpers.js\
			$(src)/Interactions.js\
			$(src)/MouseHandler.js\
			$(src)/Renderer.js\
			$(src)/Templates.js\
			$(src)/Grid/Grid.js\
			$(src)/Element/Element.js
			
templates = $(src)/Element/element.tpl\
			$(src)/Element/element.selection.tpl\
 		    $(src)/Grid/grid.tpl

cssFiles = 	$(css)/Base.css\
			$(css)/Editor.css\
			$(css)/Grid.css\
			$(css)/Button.css\
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

