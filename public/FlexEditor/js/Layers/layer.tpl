/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Layer = '

	<div class="element {{?it.selected}}element-selected{{?}}" data-element-id="{{=it.id}}">
		<div class="element-attributes">
			<div class="attribute attribute-position">R</div>
			<div class="attribute attribute-bg"></div>
		</div>
		Layer
	</div>

';