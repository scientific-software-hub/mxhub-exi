<table style='border : 1px solid #000000;'>
    {#datacollections}
    <tr>
        <td colspan="6" style='border : 1px solid #000000;background-color:#E0E0E0;'>
              <span style='font-size:12px;color:blue;' >
                     <kbd style='background-color:#CCCCCC;color:blue;'>
                        {.DataCollectionGroup_experimentType}
                     </kbd> 
                      <span style='color:blue;'>
                     {@formatDate date=.DataCollectionGroup_startTime format="YYYY-MM-DD HH:mm:ss" /}
                     </span>                                   
                </span>
             <p><b>{.DataCollection_imageDirectory}</b></p>      
         </td>
    </tr>
    <tr>
        <td style='border : 1px solid #000000;width:20%;'>{>"first.general.mxdatacollectiongrid.template"  /}</td>
        <td style='border : 1px solid #000000;width:20%;'>{>"second.general.mxdatacollectiongrid.template"  /}</td>
        <td style='border : 1px solid #000000;width:15%;'>
            {@eq key=isScreeningVisible  type="boolean"  value="true"}
                {@ne key=ScreeningOutput_indexingSuccess value=null}
                    <table class="table">
                            <tr>
                                <td ><kbd style='background-color:#CCCCCC;color:blue;'>Indexed</kbd></td> 
                                <td>
                                    {@eq key=ScreeningOutput_indexingSuccess type="boolean" value="true"}
                                        <div class='summary_datacollection_success'></div>
                                    {:else}
                                        <div class='summary_datacollection_failed'></div>
                                    {/eq}
                                </td>
                                <td>Mosaicity</td> <td class='column_parameter_value'>{@decimal key="ScreeningOutput_mosaicity" decimals=2 /}</td>
                            </tr>
                            
                            {@ne key=ScreeningOutput_strategySuccess value=null}                    
                                    <tr>
                                        <td><kbd style='background-color:#CCCCCC;color:blue;'>Strategy</kbd></td> 
                                    
                                            {@eq key=ScreeningOutput_strategySuccess type="boolean" value="true"}
                                                <td> <div class='summary_datacollection_success'></div></td> 
                                                    <td>Space Group</td> <td class='column_parameter_value'>{.ScreeningOutputLattice_spaceGroup}</td>                                                        
                                                <tr>
                                                    <td>Rank. Res.</td> <td class='column_parameter_value'>{.ScreeningOutput_rankingResolution} &#8491;</td>
                                                    <td>Exp. Time</td> <td class='column_parameter_value'>{.ScreeningStrategySubWedge_exposureTime} s</td>
                                                </tr>                                                               
                                                <tr>
                                                        <td>Images</td> <td class='column_parameter_value'>{.ScreeningStrategySubWedge_numberOfImages}</td>
                                                    <td>Total rotation</td> <td class='column_parameter_value'>{.ScreeningStrategySubWedge_oscillationRange} &deg;</td>
                                                </tr>  
                                                <tr>
                                                        <td>Transmission</td> <td class='column_parameter_value'>{@decimal key="ScreeningStrategySubWedge_transmission" decimals=1 /} %</td>
                                                        <td></td> <td class='column_parameter_value'></td>
                                                    
                                                </tr>     
                                                
                                            {:else}
                                                <td><div class='summary_datacollection_failed'></div></td>
                                            {/eq}
                                    
                                    </tr> 
                                                                                                        
                            {/ne}                                                                                                                                                                                                           
                    </table>
                    {@eq key=ScreeningOutput_strategySuccess type="boolean" value="true"}
                        {>"unitcell.screening.mxdatacollectiongrid.template"  /}  
                    {/eq}                             
                {/ne}
            {/eq} 
            {>"autoproc.mxdatacollectiongrid.template"  /}       
        </td>
        <td style='border : 1px solid #000000; width:100px;'>
            <img alt="Image not found" crossOrigin="Anonymous" src="{.urlThumbnail}" width="200" height="200" style="width:200pt;height:200pt;"/>
        </td>
        <td style='border : 1px solid #000000; width:100px;'>         
            <img alt="Image not found" src="{.xtal1}" crossOrigin="Anonymous" width="200" height="200" style="width:200pt;height:200pt;"/>
        </td>
        <td style='border : 1px solid #000000; width:100px;'>         
            <img  alt="Image not found" src="{.indicator}" crossOrigin="Anonymous" width="200" height="200" style="width:200pt;height:200pt;"/>
        </td>
    </tr>
    <tr>
        <td colspan="6" style='border : 1px solid #000000; width:100px;'>
            Comments:<b id="comments_{.DataCollectionGroup_dataCollectionGroupId}">{@trim key="DataCollectionGroup_comments" /}</b>
        </td>
    </tr>
    <tr>
        <td colspan="6" style="height:75px"></td>
    </tr>
    {/datacollections}
</table>