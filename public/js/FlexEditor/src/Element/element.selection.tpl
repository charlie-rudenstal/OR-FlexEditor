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

	<div class="component preselection {{=it.customClass || ""}}
				{{?it.image}}hasImage{{?}}" 
		 style="left: {{=it.x(null, it.position)}}{{#def.unit}};
	 	     	top: {{=it.y(null, it.position)}}{{#def.unit}};
	 	     	width: {{=it.width(null, it.position)}}{{#def.unit}};
	 	     	height: {{=it.height(null, it.position)}}{{#def.unit}};">
	 		 	
	 	{{?it.image}}
			<div style="background: url({{=it.image}}) no-repeat center center; position: absolute;
						background-size: {{=it.width(null, "absolute")}}px auto;
						width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}

	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}

		<span class="label label-info" style="position: absolute; 
											  top: 50%; 
											  left: 50%; 
											  margin-top: -9px; 
											  margin-left: -35px;">


			{{=Math.round(it.width(null, it.position))}}{{#def.unit}} 
			<span style="color: #2A779D;">x</span> 
			{{=Math.round(it.height(null, it.position))}}{{#def.unit}}

		</span>
		
	</div>

';