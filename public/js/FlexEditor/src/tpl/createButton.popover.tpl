/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.CreateButtonPopover = '

<div class="createButtonPopover">
	<form>
		<div>
			<div class="input-append color" data-color="{{=it.foreground}}" data-color-format="rgba">
				<input type="text" name="inputText" class="input" id="inputText" placeholder="Text" value="{{? it.text}}{{! it.text}}{{?}}" />
				<input type="text" name="inputForeground" value="{{=it.foreground}}" class="colorInput" id="inputForeground" style="display: none;" />
				<span class="add-on"><i style="background-color: {{=it.foreground}}"></i></span>
			</div>
			<div class="input-append color" data-color="{{=it.background}}" data-color-format="rgba">
				<input type="text" name="inputImage" class="input" id="inputImage" placeholder="Image URL" value="{{? it.image}}{{! it.image}}{{?}}" />
				<input type="text" name="inputBackground" value="{{=it.background}}" class="colorInput" id="inputBackground" style="display: none;" />
				<span class="add-on"><i style="background-color: {{=it.background}}"></i></span>
			</div>
		</div>
		<div>  
			<input type="submit" class="btn btn-primary" value="OK" data-accept="form" />
			<a href="#" class="btn" data-dismiss="popover">Close</a>
		</div>	
	</form>
</div>

';