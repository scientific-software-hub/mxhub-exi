
<form action="{.url}" method="post" id="structure-form" enctype="multipart/form-data" style='margin:20px;'>
    <div class="form-group">
        <label for="formGroupExampleInput">{.label}</label>
        <input name="groupName" type="text" class="form-control" id="structure-group-name" placeholder="Items with same name will be grouped together">
  </div>
        <label for="sel1">Type:</label>
        <select name="type" class="form-control" id="structure-type">
            {#types}
                <option>{.}</option>
            {/types}
           
        </select>
        <br />
        <label for="exampleInputFile">File input</label>
        <input type="hidden" id="structure-fileName" name="fileName" value="">
        <input name="file" type="file" class="form-control-file" id="structure-input-file" aria-describedby="">
            <small id="fileHelp" class="form-text text-muted">Choose a file</small>
  
</form> 