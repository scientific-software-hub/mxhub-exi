<table class="table">   
   <tr>
      <td>Sample</td>
      <td class='column_parameter_value'>{.BLSample_name}</td>
   </tr>
    <tr>
      <td>Grid Squares</td>
      <td class='column_parameter_value'>{@decimal key="numberOfGridSquares" decimals=0 /}</td>
   </tr> 
   <tr>
      <td>Voltage</td>
      <td class='column_parameter_value'>{.DataCollection_voltage} V</td>
   </tr>
   <tr>
      <td>Spherical Aberration</td>
      <td class='column_parameter_value'>2.7 mm</td>
   </tr>
   <tr>
      <td># Frames</td>
      <td class='column_parameter_value'>{.DataCollection_numberOfImages}</td>
   </tr>
   <tr>
      <td>Amplitude Contrast</td>
      <td class='column_parameter_value'>10 %</td>
   </tr>
   {?DataCollection_xBeamPix}
   <tr>
      <td>Sampling Rate</td>
      <td class='column_parameter_value'>{.DataCollection_xBeamPix} &Acirc;/pixel</td>
   </tr>
   {/DataCollection_xBeamPix}
</table>