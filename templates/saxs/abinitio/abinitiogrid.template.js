
<div id={.id} class="container-fluid">
    <div class="row">
        <div class="col-xs-12 col-md-12  col-lg-3">
            <img src='{.NsdURL}' style='height:300px;' />
        </div>
        <div class="col-xs-12 col-md-12 col-lg-3">
            <img src='{.Chi2RgURL}' style='height:300px;' />
        </div>
        <div class="col-xs-12 col-md-12 col-lg-3">
        <br /> 
            <table>                               
                <tr>
                    <td>
                        <div background-color="red" id="{.id}fir" width="195" height="250"></div>
                    </td>
                </tr>
                <tr style="text-align: center;font-style:italic;color:gray;">
                    <td>Fit of the simulated scattering curve versus a smoothed experimental data (spline interpolation)</td>
                </tr>
            </table>
        </div>
        <div class="col-xs-12 col-md-12 col-lg-3">
         <br /> 
            <table>               
                
                <tr>
                    <td>
                        <div background-color="red" id="{.id}fit" width="195" height="250"></div>
                    </td>
                </tr>
                <tr style="text-align: center;font-style:italic;color:gray;">
                    <td>Fit of the simulated scattering curve versus the experimental data.</td>
                </tr>
            </table>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12 col-md-12 col-lg-3">
            <br /><br />
            <textarea id='{.id}_pdb_src' style='width:300px; height: 300px;display: none;' ></textarea>
            <div id='{.id}_pdb' style='width: 400px; height: 400px; background-color: black;' ></div>
        </div>
        <div class="col-xs-12 col-md-12 col-lg-9">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th >Type</th>
                        <th >chiSqrt</th>
                        <th >rFactor</th>
                        <th >Rg</th>
                        <th >PDB</th>
                        <th >Fir</th>
                        <th >Log</th>

                    </tr>

                </thead>

                {#.models}
                <tr class={.rowClass}>
                    <td>{.type}</td>
                    <td>{@decimal key="chiSqrt" decimals=3 /}  </td>
                    <td>{@decimal key="rfactor" decimals=3 /} </td>
                    <td>{@decimal key="rg" decimals=3 /} </td>
                 
                    <td><a href='{.pdbURL}' target='_blank'>{@fileName key="pdbFile" /}</a> <a href='../viewer/uglymol/index.html?pdb={.pdbURL}' target='_blank'><span class="glyphicon glyphicon-eye-open"></span></a></td>
                    <td><a href='{.firURL}' target='_blank'>{@fileName key="firFile" /}</a></td>
                    <td><a href='{.logURL}' target='_blank'>{@fileName key="logFile" /}</a></td>
                </tr>
                {/.models}
            </table>
        </div>
        </div>
    </div>