/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.CreateButtonModal = '

  <form class="form-horizontal" style="margin: 0">
	  
	  <div class="modal-body">

		    <div class="control-group">
		      <label class="control-label" for="inputText">Text</label>
		      <div class="controls">
		        <input type="text" name="inputText" id="inputText" placeholder="Text" />
		      </div>
		    </div>
	  
	  </div>

	  <div class="modal-footer">  
	  
	    <a href="#" class="btn" data-dismiss="modal">Close</a>
	    <input type="submit" class="btn btn-primary" value="Save changes" data-accept="form" />
	  
	  </div>	

  </form>
  
';