/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Element = '

	<div id="element_{{=it.property("id")}}" 
	 	 class="component button"
	 	 style="left: {{=it.xUnit()}};
	 	     	top: {{=it.yUnit()}};
	 	     	width: {{=it.widthUnit()}};
	 	     	height: {{=it.heightUnit()}};
	 	     	background: {{=it.property("background")}}">

		<div class="content">
			{{=it.contentTemplate(it)}}
		</div>

	</div>

';