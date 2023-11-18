
<table class='table-sm table table-striped'>
    {#.phasing[0]}	
     <thead>   
                <tr>
                    <th>Phasing</th>
                    <th><abbr title="Prepare Step">PR</abbr></th>
                    <th><abbr title="Substructure Determination Step">SU</abbr></th>
                    <th><abbr title="Phasing Step">PH</abbr></th>
                    <th><abbr title="Model Building Step">MO</abbr></th>
                    
                </tr>
    </thead>
    {/.phasing[0]}
       <tbody>               
        {#.phasing}		
                <tr>
                    <td><a href='#/phasing/autoprocintegrationId/{.autoProcIntegrationId}/main'>{.spaceGroup}</a></td>
                    <td>
                        {@eq key=prepare type="boolean" value="true"}
                            <span style='color:green;' class="glyphicon glyphicon-ok"></span>
                        {:else}
                            <span style='color:red;' class="glyphicon glyphicon-remove"></span>
                        {/eq}
                    </td>
                    <td>
                        {@eq key=sub type="boolean" value="true"}
                            <span style='color:green;' class="glyphicon glyphicon-ok"></span>
                        {:else}
                            <span style='color:red;' class="glyphicon glyphicon-remove"></span>
                        {/eq}
                    </td>
                     <td>
                        {@eq key=phasing type="boolean" value="true"}
                            <span style='color:green;' class="glyphicon glyphicon-ok"></span>
                        {:else}
                            <span style='color:red;' class="glyphicon glyphicon-remove"></span>
                        {/eq}
                    </td>
                      <td>
                        {@eq key=model type="boolean" value="true"}
                            <span style='color:green;' class="glyphicon glyphicon-ok"></span>
                        {:else}
                            <span style='color:red;' class="glyphicon glyphicon-remove"></span>
                        {/eq}
                    </td>
                    
                </tr>
        {/.phasing}
      </tbody>
</table>
   

   {!
       <div class="showme" >
      <table>
         {#.[0]}
         <tr>
            <td style='width : 100px;color:white;border-radius: 5px;text-align:center;height:20px;background-color:#3892d3;'><a style='color:white;text-decoration: none;' href='#/phasing/autoprocintegrationId/{.autoProcIntegrationId}/main'>Open Phasing</a></td>
         </tr>
         {/.[0]}
      </table>
   </div>
   !}

