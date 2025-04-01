<table>
   <tr>
      <td>
         <div class="alert-warning" style="margin-bottom: 1px;height: 20px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;">
            <span class="glyphicon glyphicon-info-sign" style='margin:2px;'>  </span>
            Requirements:
         </div>
      </td>
      <td>
         <div id="{.uniquenessParcelPanelId}" class="alert alert-warning" style="margin-bottom: 1px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;" role="alert">
            "Dewar Name" should be unique for the <u>whole shipment</u>
         </div>
      </td>
      <td>
         <div id="{.uniquenessContainerNamelPanelId}" class="alert alert-warning" style="margin-bottom: 1px;height: 20px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;" role="alert">
            "Container Name" should be unique for <u>this shipment</u>
         </div>
      </td>
      <td>
         <div id="{.acceptedContainerListPanelId}" class="alert alert-warning" style="margin-bottom: 1px;height: 20px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;" role="alert">
         {@eq key=showOnlyUnipuckMessage value="true" type="boolean"}
            {@eq key=siteName value="MAXIV"}
               Only Unipuck container type at MAX IV
            {/eq}
            {@eq key=siteName value="DESY"}
               Only <u>Unipuck</u> "Container Type" at DESY
            {/eq}
         {:else}
            Accepted values for container type are: SPINEpuck, Unipuck
         {/eq}
         </div>
      </td>
      <td>
         <div id="{.noProteinInDb}" class="alert alert-warning" style="margin-bottom: 1px;height: 20px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;" role="alert">
            Protein should be <u>added before</u> importing/adding.
         </div>
      </td>
      <td>
         <div id="{.uniquenessSampleNamePanelId}" class="alert alert-warning" style="margin-bottom: 1px;height: 20px;  line-height:20px;  padding:0px 5px 0px 10px;display:inline-block;margin:5px;" role="alert">
            "Protein" + "Sample Name" should be unique for the <u>whole shipment</u>
         </div>
      </td>
   </tr>
    <tr style='height:35px;'>
      <td>
       
      </td>
      <td>
       
      </td>
      <td>
       
      </td>
      <td>
       
      </td>
   </tr>
</table>