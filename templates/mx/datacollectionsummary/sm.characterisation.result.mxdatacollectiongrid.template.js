<table class='table-sm table table-striped'>
    <thead>
        <tr>
            <td style='padding:0 15px 0 15px;'>Indexed</td> 
            <td style='padding:0 15px 0 15px;'>
                {@eq key=.ScreeningOutput_indexingSuccess type="boolean" value="true"}
                    <div class='summary_datacollection_success'></div>
                {:else}
                    <div class='summary_datacollection_failed'></div>
                {/eq}
            </td>
            {@eq key=.ScreeningOutput_indexingSuccess type="boolean" value="true"}
            <td style='padding:0 15px 0 15px;'>Space Group</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{.ScreeningOutputLattice_spaceGroup}</td>                                                        
            {:else}
            <td style='padding:0 15px 0 15px; width:60px;'></td> 
            <td style='padding:0 15px 0 15px; width:60px;'></td> 
            {/eq}    
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style='padding:0 15px 0 15px;'>Strategy</td> 
        
            {@eq key=.ScreeningOutput_strategySuccess type="boolean" value="true"}
                <td style='padding:0 15px 0 15px;'> <div class='summary_datacollection_success'></div></td> 
                <td style='padding:0 15px 0 15px;'>Rank. Res.</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{.ScreeningOutput_rankingResolution} &#8491;</td>
         </tr>
         <tr>
                 <td style='padding:0 15px 0 15px;'>Images</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{.ScreeningStrategySubWedge_numberOfImages}</td>
                 <td style='padding:0 15px 0 15px;'>Osc. range</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{.ScreeningStrategySubWedge_oscillationRange} &deg;</td>
         </tr>
         <tr>
                 <td style='padding:0 15px 0 15px;'>Exp. Time</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{.ScreeningStrategySubWedge_exposureTime} s</td>
                 <td style='padding:0 15px 0 15px;'>Transmission</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{@decimal key="ScreeningStrategySubWedge_transmission" decimals=1 /} %</td>                {:else}
            {:else}
                 <td style='padding:0 15px 0 15px;'><div class='summary_datacollection_failed'></div></td>
                 {@eq key=.ScreeningOutput_indexingSuccess type="boolean" value="true"}
                 <td style='padding:0 15px 0 15px;'>Mosaicity</td> <td style='padding:0 15px 0 15px;' class='column_parameter_value'>{@decimal key="ScreeningOutput_mosaicity" decimals=2}{/decimal}</td>
                 {:else}
                 <td style='padding:0 15px 0 15px; width:60px;'></td> 
                 <td style='padding:0 15px 0 15px; width:60px;'></td> 
                 {/eq}
                 
            {/eq}
         </tr> 
     </tbody>
</table>
