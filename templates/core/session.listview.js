


<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">  {.month} {.day} {.year}</h3>
  </div>
  <div class="panel-body">
   <p style='font-size:18px;'>{.beamLineName}</p>
   <p>{.nbShifts} shifts</p>
   
   <div style='font-weight:italic;font-size:10px;width: 100%;  word-break: break-all;  white-space: normal;'>
     {.comments}
   </div>
  
    <!-- List group -->
    <ul class="list-group">
    
        
        {@gt key=sampleCount value=0}
            <li class="list-group-item">
                <span style='background-color:#337ab7;' class="badge badge-primary">{.sampleCount}</span>
                Samples
            </li>
        {/gt}
        
        {@gt key=testDataCollectionGroupCount value=0}
            <li class="list-group-item">
                <span style='background-color:#337ab7;' class="badge">{.testDataCollectionGroupCount}</span>
                Tests
            </li>
        {/gt}
        
        {@gt key=dataCollectionGroupCount value=0}
            <li class="list-group-item">
                <span style='background-color:#337ab7;' class="badge">{.dataCollectionGroupCount}</span>
                Data Collections
            </li>
        {/gt}
        
        
        {@gt key=xrfSpectrumCount value=0}
            <li class="list-group-item">
                <span style='background-color:#337ab7;' class="badge">{.xrfSpectrumCount}</span>
                Spectra
            </li>
        {/gt}
        
        {@gt key=energyScanCount value=0}
            <li class="list-group-item">
                <span style='background-color:#337ab7;' class="badge">{.energyScanCount}</span>
                Energy Scans
            </li>
        {/gt}
    
    </ul>
  
  
  <p style='font-size:10px;'>Local contact: {.beamLineOperator}</p>
  </div>
</div>

 

 
