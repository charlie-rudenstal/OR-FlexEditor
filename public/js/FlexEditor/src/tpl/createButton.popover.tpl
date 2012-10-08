/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.CreateButtonPopover = '

<div class="createButtonPopover">
	<form>
		<div>
			<input type="text" name="inputText" class="input" id="inputText" placeholder="Text" value="{{? it.text}}{{! it.text}}{{?}}" />
			<input type="text" name="inputImage" class="input" id="inputImage" placeholder="Image URL" value="{{? it.image}}{{! it.image}}{{?}}" />
		</div>
		<div>  
			<input type="submit" class="btn btn-primary" value="OK" data-accept="form" />
			<a href="#" class="btn" data-dismiss="popover">Close</a>
		</div>	
	</form>
</div>

';