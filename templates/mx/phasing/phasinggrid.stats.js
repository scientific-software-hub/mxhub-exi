


<div>
    
    <table>
        {#[0]}
        <tr>
            {!<th>Type</th> 
            <th>Program</th>!}
            <th class="datacollection_parameter_name" style='width:70px;'>Resolution</th>
            <th class="datacollection_parameter_name" style='width:70px;'>Method</th>
            <th class="datacollection_parameter_name" style='width:70px;'>Enantiomorph</th>
            <th  class="datacollection_parameter_name"style='width:70px;'>SpaceGroup</th>
            <th class="datacollection_parameter_name" style='width:70px;'>Solvent</th>
            <th class="datacollection_parameter_name" style='width:120px;'>Statistics</th>            
               
            
             
        </tr>  
        {/[0]}  
     {#.}	    
        <tr  class='selectable_row'>
            {!
                <td>{.phasingStepType}</td>
                <td>{.phasingPrograms}</td>
            !}
            <td>{.lowRes} - {.highRes}</td>
            <td>{.method}</td>
            <td>{.enantiomorph}</td>
            <td>{.spaceGroup} ({.spaceGroupShortName})</td>
            <td>{.solventContent}</td>
            <td>
                <table>
                    {#.statistics}
                    <tr>
                        <td>{.name}</td>
                         <td>{.value}</td>
                    <tr>
                    {/.statistics}
                </table>  
            </td>
        </tr>  
            
                             
     {/.}       
    
     </table>
</div>
	
	



