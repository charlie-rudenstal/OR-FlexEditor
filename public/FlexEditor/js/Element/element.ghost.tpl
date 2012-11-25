/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementGhost = '

	<div id="element_{{=it.property("id")}}" 
	 	 class="component button"
	 	 style="left: {{=it.xUnit()}};
	 	     	top: {{=it.yUnit()}};
	 	     	width: {{=it.widthUnit()}};
	 	     	height: {{=it.heightUnit()}};
	 	     	background: none;
	 	     	border: 1px solid #3276a9;
	 	     	">

		<div class="content">
			{{=it.property("tja")}}
		</div>

	</div>

';