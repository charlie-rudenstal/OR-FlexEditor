/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Element = '

	<div id="element_{{=it.id}}" 
	 	 class="component button"
	 	 style="left: {{=it.x(null, "absolute")}}px;
	 	     	top: {{=it.y(null, "absolute")}}px;
	 	     	width: {{=it.width(null, "absolute")}}px;
	 	     	height: {{=it.height(null, "absolute")}}px;
	 	     	background-color: {{=it.background}}
	 	     	">

		<div class="content" style="color: {{=it.foreground}}">
			{{=it.contentTemplate(it)}}
		</div>

	</div>

';