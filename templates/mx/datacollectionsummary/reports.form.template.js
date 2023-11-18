<div id="{id}-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Reports</h4>
      </div>
      <div class="modal-body">
        <div class="form-group row">
            <label class="col-sm-12 col-form-label">General report:</label>
        </div>
        <div class="form-group row">
            <div class="col-sm-2">
                <button id="{id}-general-report-doc" class="btn btn-default report-btn" disabled>
                    <img src="../images/Word.png" width="32px"/>
                </button>
            </div>
            <div class="checkbox col-sm-10">
                <label><input id="{id}-include-failed" type="checkbox" value="" checked>Include failed</label>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="{id}-close" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button id="{id}-export" type="button" class="btn btn-primary" >Export</button>
      </div>
    </div>
  </div>
</div>