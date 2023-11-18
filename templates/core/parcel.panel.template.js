<div class="container-fluid" style="padding:0px">
    <div class="row">
        <div class="col-md-12">
            <table class="table valign-middle-rows small-padding-rows" style="margin:0px;">
                <tr>
                    <td id="{id}-index-td" rowspan="1" style="background-color:#f5f5f5;width:25px;border-top:none;"><span style="font-size: 10px;">#{dewar.index}</span></td>
                    <td style="border-top:none;">
                        <div class="container-fluid">
                            <div class="row">
                                <div id="{id}-parameters-div" class="col-md-2" style="text-align:center;padding:0px;">
                                </div>
                                <div id="{id}-container-panel-div" class="col-md-10">
                                </div>
                            </div>
                        </div>
                    </td>
                    <td id="{id}-buttons-td" rowspan="1" style="background-color:#ddd;border-top:none;">
                        <table class="table valign-middle-rows small-padding-rows table-disabled" style="margin:0px;">
                            <tr>
                                <td>
                                    <a id="{id}-add-button" class="btn btn-xs disabled">
                                        <span class="glyphicon glyphicon-plus-sign"></span> Add container
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a id="{id}-edit-button" class="btn btn-xs disabled">
                                        <span class="glyphicon glyphicon-edit"></span> Edit
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a id="{id}-euro-button" class="btn btn-xs disabled">
                                        <span class="glyphicon glyphicon-euro"></span> Reimburse
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a id="{id}-print-button" class="btn btn-xs" target="_blank">
                                        {?dewar.dewarStatus}
                                            <span class="glyphicon glyphicon-print"></span> Print labels
                                        {:else}
                                             <div class="alert-warning" role="alert"><span class="glyphicon glyphicon-alert"></span> Print labels</div>
                                        {/dewar.dewarStatus}
                                    </a>
                                </td>
                            </tr>
                             <tr>
                                <td>
                                    <a id="{id}-import-button" class="btn btn-xs">
                                         <span class="glyphicon glyphicon-import"></span> Import from CSV
                                    </a>
                                </td>
                            </tr>
                             

                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div id="{id}-comments">
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</div>