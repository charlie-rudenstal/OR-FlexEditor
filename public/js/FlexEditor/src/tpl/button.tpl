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

	<div class="component button " 
		 style="left: {{=it.rect.x}}{{#def.unit}};
	 	     	top: {{=it.rect.y}}{{#def.unit}};
	 	     	width: {{=it.rect.width}}{{#def.unit}};
	 	     	height: {{=it.rect.height}}{{#def.unit}};">

	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}

		{{=it.text}}
		
	</div>

';