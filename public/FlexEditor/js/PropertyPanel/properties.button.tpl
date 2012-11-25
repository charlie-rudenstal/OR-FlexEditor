/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.PropertiesButton = '

	<div class="propertyPanel" style="left: {{=it.x}}px; top: {{=it.y}}px;">

		<div class="propertyPanel-header">Text Properties</div>
		
		<div class="properties">
			<div class="property">
				<div class="property-label">Text</div>
				<div class="property-input"><input type="text" value="{{=it.element.property("text")}}" data-property="text" /></div>
			</div>			
			<div class="property">
				<div class="property-label">Action</div>
				<div class="property-input"><input type="text" value="{{=it.element.property("actionUrl")}}" data-property="actionUrl" /></div>
			</div>
			<div class="property">
				<div class="property-label">Bg</div>
				<div class="property-input"><input type="text" value="{{=it.element.property("background")}}" data-property="background" /></div>
			</div>
			<div class="property">
				<div class="property-label">Fg</div>
				<div class="property-input"><input type="text" value="{{=it.element.property("foreground")}}" data-property="foreground" /></div>
			</div>
			<div class="property">
				<div class="btn btn-delete">Remove</div>
			</div>
		</div>

	</div>

';