/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Layer = '

	<div class="layer-element {{?it.selected}}layer-element-selected{{?}}" data-element-id="{{=it.property("id")}}">
		<div class="layer-element-attributes">
			<div class="attribute attribute-locked">
				{{?it.property("locked")}}
					<i class="icon-lock"></i>
				{{??}}
					<i class="icon-unlock"></i>
				{{?}}
			</div>
			<div class="attribute attribute-position">
				{{?it.property("positionType") == "absolute"}}
					<i class="icon-move"></i>
				{{??}}
					<i class="icon-asterisk"></i>
				{{?}}</div>
			<div class="attribute attribute-bg" style="background-color: {{=it.property("background")}}"></div>
		</div>
		{{?it.property("text")}}
			{{=it.property("text")}}
		{{??}}
			{{=it.property("contentType")}} Element
		{{?}}
	</div>

';