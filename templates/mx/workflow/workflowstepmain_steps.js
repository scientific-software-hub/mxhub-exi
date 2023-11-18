{#.}
    <table>
      <tr>
            <td style='text-align:center;'>
                            {@eq key=status value="Success"}<div class='summary_datacollection_success'></div>{/eq}
                            {@eq key=status value="Failure"}<div class='summary_datacollection_failed'></div>{/eq}
                            <span>{.workflowStepType}</span>
            </td>
        </tr>
        
        <tr>
            <td>
                <img src="{.imageURL}" style='border:1px solid #3892d3;' alt="{.workflowStepType}" height="100" width="100">
            </td>
        </tr>
      
    </table>
		
{/.}	

