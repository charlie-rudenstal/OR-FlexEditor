/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Preselection = '

	{{##def.unit:
		{{? it.position == "relative" }}
		%
		{{?? it.position == "absolute" }}
		px
		{{??}} 
		px
		{{?}}
	#}}

	<div class="component preselection" 
		 style="left: {{=it.left}}{{#def.unit}};
	 	     	top: {{=it.top}}{{#def.unit}};
	 	     	width: {{=it.width}}{{#def.unit}};
	 	     	height: {{=it.height}}{{#def.unit}};">

		<span class="label label-info" style="position: absolute; 
											  top: 50%; 
											  left: 50%; 
											  margin-top: -9px; 
											  margin-left: -35px;">
			{{=it.width}}{{#def.unit}} 
			<span style="color: #2A779D;">x</span> 
			{{=it.height}}{{#def.unit}}
		</span>
		
	</div>

';