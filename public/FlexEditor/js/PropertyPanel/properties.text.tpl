/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.PropertiesText = '

	<div class="propertyPanel" style="left: {{=it.x}}px; top: {{=it.y}}px;">

		<div class="propertyPanel-header">Text Properties</div>
		
		<div class="properties">
			<div class="property">
				<div class="property-label">Text</div>
				<div class="property-input"><input type="text" value="{{=it.element.text}}" data-property="text" /></div>
			</div>
			<div class="property">
				<div class="property-label">Bg</div>
				<div class="property-input"><input type="text" value="{{=it.element.background}}" data-property="background" /></div>
			</div>
			<div class="property">
				<div class="property-label">Fg</div>
				<div class="property-input"><input type="text" value="{{=it.element.foreground}}" data-property="foreground" /></div>
			</div>
			<div class="property">
				<div class="property-label">Halign</div>
				<div class="property-input"><input type="text" value="{{=it.element.halign}}" data-property="halign" /></div>
			</div>
			<div class="property">
				<div class="property-label">Valign</div>
				<div class="property-input"><input type="text" value="{{=it.element.valign}}" data-property="valign" /></div>
			</div>
			<div class="property">
				<div class="property-label">Padding</div>
				<div class="property-input"><input type="text" value="{{=it.element.padding}}" data-property="padding" /></div>
			</div>
			<div class="property">
				<div class="btn btn-delete">Remove</div>
			</div>
		</div>

	</div>

';