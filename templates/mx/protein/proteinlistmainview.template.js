<div class="container-fluid">
    <div class="panel with-nav-tabs panel-default">
        <div class="panel-heading clearfix">
            <div class="pull-left">
                <span style='font-size:14px;color:blue;' >
                    <kbd style='background-color:#CCCCCC;color:blue;'>
                        {.acronym}
                    </kbd>
                    <span style='font-size:12px;color:gray;'>
                        {?latestDataCollectionTime}
                        Collected last time on {.latestDataCollectionTime}
                        {/latestDataCollectionTime}
                </span>
            </span>
                    <p><b>{.name}</b></p>
         </div>  
                <div class="pull-right">
                    <ul class="nav nav-tabs" id="myTabs">
                        <li class="active"><a data-toggle="tab" href="#summary_{.proteinId}"> Summary</a></li>
                        <li><a data-toggle="tab" href="#cr_{.proteinId}"> Crystal Forms <span class="badge" style='background-color:#337ab7;'>{.CrystalCount}</span></a></li>
                    </ul>

                </div>
            </div>
            <div class="tab-content">
                <div id="summary_{.proteinId}" class="tab-pane fade in active">
                    <div class="container-fluid">
                        <div class="row">
                            <br />
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-sm-2">
                                        {>"first.proteinlistmainview.template" /}                             
                                    </div>
                                    <div class="col-sm-2">
                                        {>"second.proteinlistmainview.template" /}  
                                    </div>
                                    <div class="col-sm-2">
                                        {>"third.proteinlistmainview.template" /}  
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>

                <div id="cr_{.proteinId}" class="tab-pane fade">                         
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-xs-12 col-md-12" id="__cr_{.proteinId}">
                                <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;' src='../images/loading-animation.gif' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

