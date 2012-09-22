/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Button = '

	{{##def.unit:
		{{? it.position == "relative" }}
		%
		{{?? it.position == "absolute" }}
		px
		{{??}} 
		px
		{{?}}
	#}}

	<div class="component button" 
		 style="left: {{=it.left}}{{#def.unit}};
	 	     	top: {{=it.top}}{{#def.unit}};
	 	     	width: {{=it.width}}{{#def.unit}};
	 	     	height: {{=it.height}}{{#def.unit}};">

		{{=it.text}}
		
	</div>

';