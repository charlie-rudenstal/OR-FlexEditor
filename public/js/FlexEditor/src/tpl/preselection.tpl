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

	<div class="component preselection {{=it.customClass || ""}}" 
		 style="left: {{=it.rect.x}}{{#def.unit}};
	 	     	top: {{=it.rect.y}}{{#def.unit}};
	 	     	width: {{=it.rect.width}}{{#def.unit}};
	 	     	height: {{=it.rect.height}}{{#def.unit}};">
	 	
	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}



		<span class="label label-info" style="position: absolute; 
											  top: 50%; 
											  left: 50%; 
											  margin-top: -9px; 
											  margin-left: -35px;">


			{{=it.rect.width}}{{#def.unit}} 
			<span style="color: #2A779D;">x</span> 
			{{=it.rect.height}}{{#def.unit}}

		</span>
		
	</div>

';