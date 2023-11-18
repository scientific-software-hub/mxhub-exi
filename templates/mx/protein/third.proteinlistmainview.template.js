 {@gt key=ModelBuildingPhasingStepCount value=0}      
    <table class="table"   style="height:10px">
    <tr>
        <th colspan='2' style='text-align:center;background-color:#f5f5f5'>Automatic SAD appears to have worked</th>
    
    </tr>
 
        {#.solvedStructureSpaceGroups}
        <tr>
            <td  >Space Group</td>
            <td class='column_parameter_value'>         
                <a href='#/mx/datacollection/datacollectionid/{.dataCollectionIdList}/main'>{.name}</a>
            </td>
        </tr>   
        {/.solvedStructureSpaceGroups}

        {#.imagesPhasingProgramAttachementURL}
        <tr>
            <td  >Space Group</td>
            <td class='column_parameter_value'>                        
                       
           <img  alt="Image not found" class="img-responsive smalllazy" src="{.url}" />                        
              <a href="{.url}" data-lightbox="image-1" data-title="My caption">Image #1</a>

            </td>
        </tr>   
        {/.imagesPhasingProgramAttachementURL}

    
    </table>
{/gt}