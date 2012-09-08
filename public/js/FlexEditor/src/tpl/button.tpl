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

	<div class="component" 
		 style="left: {{=it.left}}{{#def.unit}};
	 	     	top: {{=it.top}}{{#def.unit}};">

		{{=it.text}}

	</div>

';