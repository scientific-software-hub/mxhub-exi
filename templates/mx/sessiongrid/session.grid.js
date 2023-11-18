<div class="container-fluid">
 
  <div class="row">
    <div style='font-size:10px;text-align:center;' class="col-sm-2 col-md-1 " style='margin: 0 10px 0px 0;'>
        <a href='#/mx/datacollection/session/{.sessionId}/main' title='click to go' type="button" class="btn btn-link">{.month} {.day} {.year}</a>
        <br />
        {.beamLineName}
        <br />
        {.beamLineOperator}
        
    </div>
     <div style='font-size:14px;text-align:center;' class="col-sm-2 col-md-1" >
        <a href='#/mx/datacollection/session/{.sessionId}/main'   title="{.Proposal_title}" class="btn btn-link">{.Proposal_proposalCode}{.Proposal_ProposalNumber}</a>
        <br />
        {.nbShifts} shifts     
     </div>
    <div class="col-sm-1"  style='margin: 10px 10px 0px 0;'>
         <!-- List group -->
        <ul class="list-group">
        
            
            {@gt key=sampleCount value=0}
                <li class="list-group-item">
                    <span style='background-color:#337ab7;' class="badge badge-primary">{.sampleCount}</span>
                    Samples
                </li>
            {/gt}
            
         
        </ul>
            
    </div>
    
    
     <div class="col-sm-1"  style='margin: 10px 10px 0px 0;'>
         <!-- List group -->
        <ul class="list-group">

            {@gt key=testDataCollectionGroupCount value=0}
                <li class="list-group-item">
                    <span style='background-color:#337ab7;' class="badge">{.testDataCollectionGroupCount}</span>
                    Tests
                </li>
            {/gt}
            
           
        </ul>
            
    </div>
    
     <div class="col-sm-1"  style='margin: 10px 10px 0px 0;'>
         <!-- List group -->
        <ul class="list-group">

            {@gt key=dataCollectionGroupCount value=0}
                <li class="list-group-item">
                    <span style='background-color:#337ab7;' class="badge">{.dataCollectionGroupCount}</span>
                    Collect.
                </li>
            {/gt}
            
            
        </ul>
            
    </div>
    
      <div class="col-sm-1"  style='margin: 10px 10px 0px 0;'>
         <!-- List group -->
        <ul class="list-group">

            
            {@gt key=xrfSpectrumCount value=0}
                <li class="list-group-item">
                    <span style='background-color:#337ab7;' class="badge">{.xrfSpectrumCount}</span>
                    XRF
                </li>
            {/gt}
            
              
        </ul>
            
    </div>
    
    
        <div class="col-sm-1"  style='margin: 10px 10px 0px 0;'>
         <!-- List group -->
        <ul class="list-group">        
            
            {@gt key=energyScanCount value=0}
                <li class="list-group-item">
                    <span style='background-color:#337ab7;' class="badge">{.energyScanCount}</span>
                    En. Scans
                </li>
            {/gt}        
        </ul>
            
    </div>
    
    
     <div class="col-sm-3"  style='margin: 10px 10px 0px 0;'>
        {.comments}
     </div>
  </div>
</div>