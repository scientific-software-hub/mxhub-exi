<table class="table">
   <tr>
     <th colspan='2' style='text-align:center;background-color:#f5f5f5'>Data Collections</th>
   
   </tr>
   <tr>
      <td  >Energy Scans</td>
      <td class='column_parameter_value'> 
            {@gt key=EnergyScanCount value=0}        
                    <a href='#/mx/datacollection/session/{.EnergyScanSessionIdList}/main'><span class="badge" style='background-color:#337ab7;'>{.EnergyScanCount}</span></a>
            {/gt} 
      </td>
   </tr>
   <tr>
      <td>XRF</td>
      <td class='column_parameter_value'>
        {@gt key=XFEFluorescenceSpectrumCount value=0}
            {.XFEFluorescenceSpectrumCount}
        {/gt}
      </td>
   </tr>
   <tr>
      <td>Samples</td>
      <td class='column_parameter_value'>
            {@gt key=BLSampleCount value=0}        
                    {.BLSampleCount}
            {/gt}
        </td>
   </tr>
   
   <tr>
      <td>Tests (< 4 images)</td>
      <td class='column_parameter_value'>
          
              {@gt key=TestDataCollectionCount value=0}                            
                    <a href='#/mx/datacollection/datacollectionid/{.TestDataCollectionIdList}/main'><span class="badge" style='background-color:#337ab7;'>{.TestDataCollectionCount}</span></a>
            {/gt}
      </td>
   </tr>
   <tr>
      <td>Data Collections</td>
      <td class='column_parameter_value'>
            {@gt key=DataCollectionCount value=0}                            
                    <a href='#/mx/datacollection/datacollectionid/{.DataCollectionIdList}/main'><span class="badge" style='background-color:#337ab7;'>{.DataCollectionCount}</span></a>
            {/gt}
       </td>
   </tr> 
</table>