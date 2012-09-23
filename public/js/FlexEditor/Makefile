src = src
tpl = src/tpl

start = 	$(src)/_start.js
end =		$(src)/_end.js

#$(src)/TestPerformance.js
			

files = 	$(src)/Main.js\
	 	 	$(src)/GridRenderer.js\
			$(src)/MouseHandler.js\
			$(src)/Helpers.js\
			$(src)/Modal.js\
			$(src)/Renderer.js\
			$(src)/Templates.js
			
templates = $(tpl)/button.tpl\
templates = $(tpl)/preselection.tpl\
			$(tpl)/createButton.modal.tpl\
			$(tpl)/modal.tpl

FlexEditor.js: ${files}

	# Add the function wrapper
	cat ${start} > $@

	# Append the modules
	cat ${files} >> $@

	# HTML Templates (remove newlines to support multiline strings in source)
	cat ${templates} | tr -d "\n" >> $@
	
	# And finally exposing public objects
	cat ${end} >> $@

watch:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while true ; do \
		inotifywait -qqr src; \
		$(MAKE) -s FlexEditor.js; \
	done

watchmac:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while kqwait src; do \
		echo build \
		$(MAKE) -s FlexEditor.js; \
	done	

.PHONY: watch, FlexEditor.js
.SILENT: watch FlexEditor.js 