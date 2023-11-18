<div class="container-fluid">
   {#gridSquares} 
   <div class="row">
      <div class="col-sm-1">
         <a href="{.snapshot}" data-lightbox='{.snapshot}' data-title="{.name}">
         <img  src="{.snapshot}" class='img-thumbnail' data-src="{.snapshot}"/>                  
         </a>                 
      </div>
      <div class="col-sm-1"><a href='#/em/datacollection/{.dataCollectionId}/main'>{.startTime}</a></div>
      <div class="col-sm-3" style="text-align:center;">
         <table class="table">
            <tbody>
               <tr>
                  <td>Movies</td>
                  <td><span style="background-color:#207a7a;" class="badge">{.movieCount}</span> </td>
               </tr>
               <tr>
                  <td>Motion Correction</td>
                  <td>
                     <div class="progress">
                        {@gte key=motionPercentage value=50}
                        {@gte key=motionPercentage value=80}                            
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.motionPercentage}" aria-valuemin="0" aria-valuemax="100" style="width:{.motionPercentage}%">{@decimal key="motionPercentage" decimals=1}{/decimal}%</div>
                        {:else}
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.motionPercentage}" aria-valuemin="0" aria-valuemax="100" style="background-color:#f0ad4e;width:{.motionPercentage}%">{@decimal key="motionPercentage" decimals=1}{/decimal}%</div>
                        {/gte}
                        {:else}    
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.motionPercentage}" aria-valuemin="0" aria-valuemax="100" style="background-color:#d9534f;width:{.motionPercentage}%">{@decimal key="motionPercentage" decimals=1}{/decimal}%</div>
                        {/gte}
                     </div>
                  </td>
               </tr>
               <tr>
                  <td>CTF</td>
                  <td>
                     <div class="progress">
                        {@gte key=ctfPercentage value=50}
                        {@gte key=ctfPercentage value=80}                            
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.ctfPercentage}" aria-valuemin="0" aria-valuemax="100" style="width:{.ctfPercentage}%">{@decimal key="ctfPercentage" decimals=1}{/decimal}%</div>
                        {:else}
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.ctfPercentage}" aria-valuemin="0" aria-valuemax="100" style="background-color:#f0ad4e;width:{.ctfPercentage}%">{@decimal key="ctfPercentage" decimals=1}{/decimal}%</div>
                        {/gte}
                        {:else}    
                        <div class="progress-bar progress-bar"   role="progressbar" aria-valuenow="{.ctfPercentage}" aria-valuemin="0" aria-valuemax="100" style="background-color:#d9534f;width:{.ctfPercentage}%">{@decimal key="ctfPercentage" decimals=1}{/decimal}%</div>
                        {/gte}
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
      <div class="col-sm-1" style="text-align:left;">
         <table class="table">
            <tr>
               <td>Voltage</td>
               <td class='column_parameter_value'>{.voltage}</td>
            </tr>
            <tr>
               <td>Magnification</td>
               <td class='column_parameter_value'>{.magnification}</td>
            </tr>
            <tr>
               <td>Directory</td>
               <td class='column_parameter_value'>{.imageDirectory}</td>
            </tr>
         </table>
      </div>
   </div>
   {/gridSquares}   
</div>