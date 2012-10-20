src = src
tpl = src/tpl
css = css

start = 	$(src)/_start.js
end =		$(src)/_end.js

#$(src)/TestPerformance.js
			
files = 	$(src)/Main.js\
	 	 	$(src)/GridRenderer.js\
			$(src)/MouseHandler.js\
			$(src)/Helpers.js\
			$(src)/Button.js\
			$(src)/Popover.js\
			$(src)/Renderer.js\
			$(src)/Templates.js
			
templates = $(tpl)/button.tpl\
 		    $(tpl)/preselection.tpl\
			$(tpl)/createButton.popover.tpl\
			$(tpl)/grid.tpl

cssFiles = 	$(css)/Base.css\
			$(css)/Editor.css\
			$(css)/Grid.css\
			$(css)/Popover.css\
			$(css)/Button.css\
			$(css)/Component.css\
			$(css)/Adorner.Position.css\
			$(css)/Adorner.Resize.css\

FlexEditortarget.js: ${files}

	# Add the function wrapper
	cat ${start} > FlexEditor.js

	# Append the modules
	cat ${files} >> FlexEditor.js

	# HTML Templates (remove newlines to support multiline strings in source)
	cat ${templates} | tr -d "\n" >> FlexEditor.js
	
	# And finally exposing public objects
	cat ${end} >> FlexEditor.js

FlexEditortarget.css: ${cssFiles}

	# Merge CSS files
	cat $(cssFiles) > FlexEditor.css


watch:
	echo Watching for changes and automatically merging FlexEditor.js yeah
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

