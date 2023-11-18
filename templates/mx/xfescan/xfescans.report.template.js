<table style='border : 1px solid #000000;'>
    {#xfeScans}
        <tr>
            <td colspan="2" style='border : 1px solid #000000;background-color:#E0E0E0;'>
                <h1 class="panel-title" style='color:#337ab7;'>
                    <span style='font-size:12px;'>   {.startTime}</span>
                </h1>
            </td>
        </tr>
        <tr>
            <td>
                <table class="table table-condensed">

                    <tr>      
                        <td >Start Time</td> 
                        <td class='column_parameter_value'>{.startTime}</td>        
                    </tr>
                    
                    <tr>                                
                        <td >Directory</td>
                        <td class='column_parameter_value'>{.workingDirectory}</td>                                    
                    </tr>

                    <tr> 
                        <td >Filename</td>
                        <td class='column_parameter_value'>{.filename}</td>
                    </tr>
                     
                    
                    <tr>
                        <td >Fluorescence Detector</td>
                        <td class='column_parameter_value'></td>
                    </tr>
                    <tr>
                        <td >Energy</td>
                        <td class='column_parameter_value'> {.energy} keV</td>

                    </tr>
                    
                    <tr>
                        <td >Flux @100%</td>
                        <td class='column_parameter_value'>{.flux} ph/s</td>    
                    </tr>
                    
                    <tr>      
                        <td >Transmission</td>
                        <td class='column_parameter_value'>{@decimal key="beamTransmission" decimals=2 /} %</td>
                    </tr>
                    
                    <tr>       
                        <td style='width:150px;' >Beam Size Hor</td>
                        <td class='column_parameter_value'>{.beamSizeHorizontal} &#956;m</td>
                    </tr>
                                                    
                    <tr>                            
                        <td >Beam Size Vert</td>
                        <td class='column_parameter_value'>{.beamSizeVertical} &#956;m</td>
                    </tr>

                    <tr>                                
                        <td >Exposure Time</td>
                        <td class='column_parameter_value'>{.exposureTime} s</td>                                    
                    </tr>
                    
                </table>
            </td>

            <td>
                    <div id='{.containerId}'></div>
            </td>        
        </tr>
    {/xfeScans}
</table>