<div class="container-fluid">
   <div class="panel with-nav-tabs panel-default">
      <div class="panel-heading clearfix">
         <div class="pull-left">
            <span style='font-size:12px;color:blue;' >
            <kbd style='background-color:#CCCCCC;color:blue;'>
            {.DataCollectionGroup_experimentType}
            </kbd>  
            <span style='color:blue;'>
            {@formatDate date=.DataCollectionGroup_startTime format="DD-MM-YYYY HH:mm:ss" /}
            </span>                                   
            </span>
            <p><b>{.DataCollection_imageDirectory}</b></p>
         </div>


         {@eq key=DataCollectionGroup_experimentType value="EM"}
         
         <div class="pull-right">
            <ul class="nav nav-tabs" id="myTabs">
               <li class="active"><a data-toggle="tab" href="#datacollection_{.DataCollection_dataCollectionId}"> Summary</a></li>
            </ul>
         
         </div>        
         </div>
         <div class="tab-content">
            <div id="datacollection_{.DataCollection_dataCollectionId}" class="tab-pane fade in active">
               <div class="container-fluid">
                  <div class="row">
                   <br />
                     {>"em.general.mxdatacollectiongrid.template"  /}
                  </div>
               </div>
            </div>
         </div>
         {/eq}

         {@ne key=DataCollectionGroup_experimentType value="EM"} 
         <div class="pull-right">
            <ul class="nav nav-tabs" id="myTabs">
               <li class="active"><a data-toggle="tab" href="#datacollection_{.DataCollection_dataCollectionId}"> Summary</a></li>
               <li><a data-toggle="tab" href="#experimentparameters_{.DataCollection_dataCollectionId}">Beamline Parameters</a></li>
               <li><a data-toggle="tab" href="#dc_{.DataCollectionGroup_dataCollectionGroupId}">Data Collections <span class="badge" style='background-color:#337ab7;'>{.totalNumberOfDataCollections}</span></a></li>
               <li><a data-toggle="tab" href="#sa_{.DataCollection_dataCollectionId}">Sample</a></li>
               {!
                   <li><a data-toggle="tab" href="#df_{.DataCollection_dataCollectionId}">Diffraction Plan</a></li>
               !}
               {@gt key=resultsCount   value="0"}
                   <li><a data-toggle="tab" href="#re_{.DataCollection_dataCollectionId}">Last Collect Results  <span class="badge" style='background-color:#337ab7;'>{.resultsCount}</span></a></li>
               {:else}
                   <li class="disabled"><a data-toggle="tab"> Last Collect Results</a></li>
               {/gt}
               {@gt key=workflows.length   value="0"}
                   <li><a data-toggle="tab" href="#wf_{.DataCollection_dataCollectionId}">Workflow  <span class="badge" style='background-color:#337ab7;'>{.workflows.length}</span></a></li>
               {:else}
                   <li class="disabled"><a data-toggle="tab">Workflow</a></li>
               {/gt}
               {@gt key=hasPhasing   value="0"}
                   <li><a data-toggle="tab" href="#ph_{.DataCollection_dataCollectionGroupId}">Phasing  <span class="badge" style='background-color:#337ab7;'>{.hasPhasing}</span></a></li>
               {:else}
               {! 
                   <li class="disabled"><a data-toggle="tab">Phasing</a></li>
               !}
               {/gt}
               {@gt key=hasMR   value="0"}
                   <li><a data-toggle="tab" href="#mr_{.DataCollection_dataCollectionGroupId}">MR  <span class="badge" style='background-color:#337ab7;'>{.hasMR}</span></a></li>
               {:else}
                   {! 
                       <li class="disabled"><a data-toggle="tab">Phasing</a></li>
                    !}
               {/gt}
            </ul>
         </div>
      </div>
      <br />
      <div class="tab-content">
         <div id="datacollection_{.DataCollection_dataCollectionId}" class="tab-pane fade in active">
            <div class="container-fluid">
               <div class="row">
                  {>"general.mxdatacollectiongrid.template"  /}
                  <div class="col-xs-12 col-md-1  col-lg-2">
                     {@eq key=isScreeningVisible  type="boolean"  value="true"}
                     {@ne key=ScreeningOutput_indexingSuccess value=null}
                     <table class="table">
                        <tr>
                           <td ><kbd style='background-color:#CCCCCC;color:blue;'>Indexed</kbd></td>
                           <td>
                              {@eq key=ScreeningOutput_indexingSuccess type="boolean" value="true"}
                              <div class='summary_datacollection_success'></div>
                              {:else}
                              <div class='summary_datacollection_failed'></div>
                              {/eq}
                           </td>
                           <td>Mosaicity</td>
                           <td class='column_parameter_value'>{@decimal key="ScreeningOutput_mosaicity" decimals=2 /}</td>
                        </tr>
                        {@ne key=ScreeningOutput_strategySuccess value=null}                    
                        <tr>
                           <td><kbd style='background-color:#CCCCCC;color:blue;'>Strategy</kbd></td>
                           {@eq key=ScreeningOutput_strategySuccess type="boolean" value="true"}
                           <td>
                              <div class='summary_datacollection_success'></div>
                           </td>
                           <td>Space Group</td>
                           <td class='column_parameter_value'>{.ScreeningOutputLattice_spaceGroup}</td>
                        <tr>
                           <td>Rank. Res.</td>
                           <td class='column_parameter_value'>{.ScreeningOutput_rankingResolution} &#8491;</td>
                           <td>Osc. start (total)</td>
                           <td class='column_parameter_value'>{.ScreeningStrategySubWedge_axisStart} &deg; ({.ScreeningOutput_totalRotationRange} &deg;)</td>
                        </tr>
                        <tr>
                           <td>Images</td>
                           <td class='column_parameter_value'>{.ScreeningStrategySubWedge_numberOfImages}</td>
                           <td>Osc. range</td>
                           <td class='column_parameter_value'>{.ScreeningStrategySubWedge_oscillationRange} &deg;</td>
                        </tr>
                        <tr>
                           <td>Transmission</td>
                           <td class='column_parameter_value'>{@decimal key="ScreeningStrategySubWedge_transmission" decimals=1 /} %</td>
                           <td>Exp. Time</td>
                           <td class='column_parameter_value'>{.ScreeningStrategySubWedge_exposureTime} s</td>
                        </tr>
                        {:else}
                        <td>
                           <div class='summary_datacollection_failed'></div>
                        </td>
                        {/eq}
                        </tr> 
                        {/ne}                                                                                                                                                                                                           
                     </table>
                     {@eq key=ScreeningOutput_strategySuccess type="boolean" value="true"}
                     {>"unitcell.screening.mxdatacollectiongrid.template"  /}  
                     {/eq}                             
                     {/ne}
                     {/eq}  
                     {>"autoproc.mxdatacollectiongrid.template"  /}       
                  </div>
                  <div class="col-xs-12 col-md-4 col-lg-2">
                     <a href="{.url}" data-lightbox='{.url}' data-title="#{.runNumber} {.folder}"> 
                     <img alt="Image not found" class="img-responsive lazy"  data-src="{.urlThumbnail}" />
                     </a>                           
                  </div>
                  <div class="col-xs-12 col-md-4  col-lg-2">
                     <a href="{.xtal1}"  data-lightbox="{.DataCollection_dataCollectionId}" data-title="{.Protein_acronym} : {.Protein_name}">
                        {?hasAnimated}                    
                        <img id="xtal1_{.DataCollection_dataCollectionId}" alt="Image not found" class="img-responsive smalllazy animatedXtal" data-src="{.xtal1}" data-zoom-image="{.xtal1}"/>
                        <p>Hover the mouse over for alternate view</p>
                        {:else}
                        <img id="xtal1_{.DataCollection_dataCollectionId}" alt="Image not found" class="img-responsive smalllazy" data-src="{.xtal1}" data-zoom-image="{.xtal1}"/>
                        {/hasAnimated}
                     </a>
                  </div>
                  <div class="col-xs-6 col-md-4  col-lg-2"> 
                     <a href="{.indicator}" data-lightbox='{.indicator}' data-title="#{.runNumber} {.folder}">
                     <img  alt="Image not found" class="img-responsive lazy"  data-src="{.indicator}"/>
                     </a> 
                  </div>
               </div>
               <div class="container-fluid" style="padding-bottom: 10px;">
                  <div class="col-xs-12 col-md-12">
                     {?SpaceGroupModelResolvedByPhasing}
                     <div class="alert alert-success" style='font-size:14px;'>
                        Automatic SAD appears to have worked with the space group {.SpaceGroupModelResolvedByPhasing} 
                     </div>
                     {/SpaceGroupModelResolvedByPhasing}
                  </div>
               </div>
               <div class="container-fluid" style="padding-bottom: 10px;">
                   <div class="col-xs-12 col-md-12">
                      {?SpaceGroupModelResolvedByMr}
                      <div class="alert alert-success" style='font-size:14px;'>
                         Automatic MR appears to have worked with the space group {.SpaceGroupModelResolvedByMr} 
                      </div>
                      {/SpaceGroupModelResolvedByMr}
                   </div>
                </div>
            </div>
         </div>
         <div id="experimentparameters_{.DataCollection_dataCollectionId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row">
                    {>"general.mxdatacollectiongrid.template"  /}
                  <div class="col-xs-6 col-sm-4 col-lg-2">
                     {>"beamline.mxdatacollectiongrid.template"  /}                             
                  </div>
                  <div class="col-xs-6 col-sm-4 col-lg-2">
                     {>"synchrotron.mxdatacollectiongrid.template"  /}                             
                  </div>
                  <div class="col-xs-6 col-sm-4 col-lg-2">
                     {>"beam.mxdatacollectiongrid.template"  /}                             
                  </div>
                  <div class="col-xs-6 col-sm-4 col-lg-2">
                     {>"detector.mxdatacollectiongrid.template"  /}                             
                  </div>
               </div>
            </div>
         </div>
         <div id="sa_{.DataCollection_dataCollectionId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row">
                  <div class="col-xs-6 col-md-2">
                     {>"sample.mxdatacollectiongrid.template"  /}                             
                  </div>
                  <div id="sa_{.DataCollection_dataCollectionId}_crystal_snapshots"></div>
                  <div class="col-xs-12 col-md-2">
                     <div id='sample_puck_layout_{.DataCollection_dataCollectionId}'>
                     </div>
                     <div id='sample_puck_legend_{.DataCollection_dataCollectionId}' style="height:60px">
                     </div>
                  </div>
               </div>
               <div class="container-fluid" >
                  <div class="puck-selected-panel">
                     <div id="puck_selected_info_{.DataCollection_dataCollectionId}" class="col-xs-12 col-md-12">
                     </div>
                  </div>
               </div>
            </div>
         </div>
         {!
         <div id="df_{.DataCollection_dataCollectionId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row">
                  <div class="col-xs-6 col-md-2">
                     {>"sample.mxdatacollectiongrid.template"  /}                            
                  </div>
                  <div class="col-xs-6 col-md-2">
                     {>"diffraction.mxdatacollectiongrid.template"  /}                            
                  </div>
                  <div class="col-xs-6 col-md-2">
                     <table class="table">
                        <tr>
                           <td>Radiation Sensitivity</td>
                           <td class='column_parameter_value'>{.radiationSensitivity}</td>
                        </tr>
                        <tr>
                           <td>Anomalous Scatterer</td>
                           <td class='column_parameter_value'>{.anomalousScatterer}</td>
                        </tr>
                        <tr>
                           <td>Preferred BeamSizeX</td>
                           <td class='column_parameter_value'>{.preferredBeamSizeX}</td>
                        </tr>
                        <tr>
                           <td>preferredBeamSizeY</td>
                           <td class='column_parameter_value'>{.preferredBeamSizeY}</td>
                        </tr>
                        <tr>
                           <td>Forced Space Group</td>
                           <td class='column_parameter_value'>{.forcedSpaceGroup}</td>
                        </tr>
                     </table>
                  </div>
               </div>
            </div>
         </div>
         !}
         <div id="dc_{.DataCollectionGroup_dataCollectionGroupId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row">
                  <div class="col-xs-12 col-md-12" id="__dc_{.DataCollection_dataCollectionId}">
                     <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;'src='../images/loading-animation.gif' />                                           
                  </div>
               </div>
            </div>
         </div>
         {@gt key=resultsCount   value="0"}
         <div id="re_{.DataCollection_dataCollectionId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row" style='height:600px;'>
                  <div class="col-xs-12 col-md-12" id="__re_{.DataCollection_dataCollectionId}">
                     <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;'src='../images/loading-animation.gif' />                                           
                  </div>
               </div>
            </div>
         </div>
         {/gt} 
         {@gt key=workflows.length   value="0"}
         <div id="wf_{.DataCollection_dataCollectionId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row" style='height:600px;'>
                  <div class="col-xs-12 col-md-12" id="__wf_{.DataCollection_dataCollectionId}">
                     <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;'src='../images/loading-animation.gif' />                                           
                  </div>
               </div>
            </div>
         </div>
         {/gt} 
         {@gt key=hasPhasing   value=0}
         <div id="ph_{.DataCollection_dataCollectionGroupId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row" style='height:600px;'>
                  <div class="col-xs-12 col-md-12" id="__ph_{.DataCollection_dataCollectionGroupId}">
                     <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;'src='../images/loading-animation.gif' />                                           
                  </div>
               </div>
            </div>
         </div>
         {/gt} 
         {@gt key=hasMR   value=0}
         <div id="mr_{.DataCollection_dataCollectionGroupId}" class="tab-pane fade">
            <div class="container-fluid">
               <div class="row" style='height:600px;'>
                  <div class="col-xs-12 col-md-12" id="__mr_{.DataCollection_dataCollectionGroupId}">
                     <img style='display:block;margin-left: auto;margin-right: auto;height:150px;width:150px;'src='../images/loading-animation.gif' />                                           
                  </div>
               </div>
            </div>
         </div>
         {/gt} 
      </div>
      <div class="container-fluid" style="padding-bottom: 10px;">
         <div class="col-xs-12 col-md-12">
            <div class="wordwrap">
               <a class="btn btn-xs">
               <span id="{.DataCollectionGroup_dataCollectionGroupId}-edit-comments" class="glyphicon glyphicon-edit dataCollectionGroup-edit"></span>
               </a>
               Comments:<b id="comments_{.DataCollectionGroup_dataCollectionGroupId}">{@trim key="DataCollectionGroup_comments" /}</b>
            </div>
         </div>
         {/ne}
      </div>
   </div>
</div>