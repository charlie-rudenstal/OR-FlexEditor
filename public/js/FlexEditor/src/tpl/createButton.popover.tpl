/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.CreateButtonPopover = '

<div class="createButtonPopover">
	<form>
		<div>
			<input type="text" name="inputText" id="inputText" placeholder="Text" value="{{? it.text}}{{! it.text}}{{?}}" />
		</div>
		<div>  
			<input type="submit" class="btn btn-primary" value="OK" data-accept="form" />
			<a href="#" class="btn" data-dismiss="popover">Close</a>
		</div>	
	</form>
</div>

';