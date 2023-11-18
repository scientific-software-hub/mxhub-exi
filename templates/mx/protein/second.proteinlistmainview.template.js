 {@gt key=SessionCount value=0}      
    <table class="table"   style="height:10px">
    <tr>
        <th colspan='2' style='text-align:center;background-color:#f5f5f5'>Sessions ({.SessionCount})</th>
    
    </tr>
 
        {#.sessions}
        <tr>
            <td  >{.beamline}</td>
            <td class='column_parameter_value'>         
                <a href='#/mx/datacollection/session/{.sessionId}/main'>{@formatDate date=.date format="DD-MM-YYYY" /}</a>
            </td>
        </tr>   
        {/.sessions}
    </table>
{/gt}