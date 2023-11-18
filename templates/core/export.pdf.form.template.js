<div id="{id}-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Export PDF</h4>
      </div>
      <div class="modal-body">
        <form>
            <div id="{id}-notify">
                <label style="margin-right:10px;">Select Dewars:</label>
                    
                <select id="{id}-dewars" multiple="multiple">
                    {#shipment.dewarVOs}
                        <option value="{.dewarId}" selected>{.code}</option>
                    {/shipment.dewarVOs}
                </select>
                
            </div>
            <div class="radio">
                <label><input type="radio" value="2" name="optradio" checked>Sort by dewar/container/location</label>
            </div>
            <div class="radio">
                <label><input type="radio" value="1" name="optradio">Sort by acronym/sample name</label>
            </div>
            
        </form>
      </div>
      <div class="modal-footer">
        <button id="{id}-close" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button id="{id}-export" type="button" class="btn btn-primary" >Export</button>
      </div>
    </div>
  </div>
</div>