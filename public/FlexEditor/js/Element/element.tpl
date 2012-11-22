/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Element = '

	<div id="element_{{=it.property("id")}}" 
	 	 class="component button"
	 	 style="left: {{=it.x(null, "absolute")}}px;
	 	     	top: {{=it.y(null, "absolute")}}px;
	 	     	width: {{=it.width(null, "absolute")}}px;
	 	     	height: {{=it.height(null, "absolute")}}px;
	 	     	background: {{=it.property	("background")}}">

		<div class="content">
			{{=it.contentTemplate(it)}}
		</div>

	</div>

';