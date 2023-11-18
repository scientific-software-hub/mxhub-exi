 
 
 {@eq key=experimentType value="STATIC"}       
    <kbd style='background-color:#088A08;font-size:12px;'>SAMPLE CHANGER</kbd>
    {:else}
     <kbd style='background-color:#2E9AFE;font-size:12px;'>{.experimentType}</kbd>
   
{/eq} 
<a href="{.downloadURL}">
    <span class="glyphicon glyphicon-download"></span>
</a>
<br />
{.creationDate}
<br />
{.name}
<br />
<table style='margin-left:10px;'>
    <tr>
        <td  style="height:10px;">
        Samples
        </td>
        <td style='padding-left:10px;'>
        <div class="meter-wrap">
                <div class="meter-value" style="background-color: #99CC00 ; width: {.measured}%;">
                    <div class="meter-text">{.measurementDoneCount} of {.measurementCount}</div>
                </div>
        </div>
        </td>
    </tr>
    <tr>
        <td  style="height:10px;">
        Averages
        </td>
        <td style='padding-left:10px;'>
        <div class="meter-wrap">
                <div class="meter-value" style="background-color: #99CC00 ; width: {.averaged}%;">
                    <div class="meter-text">{.measurementAveragedCount} of {.measurementCount}</div>
                </div>
        </div>
        </td>
    </tr>
    <tr>
        <td  style="height:10px;">
        Subtractions
        </td>
        <td style='padding-left:10px;'>
        <div class="meter-wrap">
                <div class="meter-value" style="background-color: #99CC00 ; width: {.subtracted}%;">
                    <div class="meter-text">{.dataCollectionDoneCount} of {.dataCollectionCount}</div>
                </div>
        </div>
        </td>
    </tr>

</table>