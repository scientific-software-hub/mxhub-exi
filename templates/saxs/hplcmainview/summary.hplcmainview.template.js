<div class="container-fluid">
    <div class="row">
        <div class="col-xs-12 col-md-12">
            <table class="table">
                <thead>
               
                    <tr>
                        <th>Frame</th>
                        <th>I0</th>                        
                        <th>Rg</th>
                        <th>Mass</th>
                      
                        <th>Download</th>
                    </tr>
                </thead>
                
                {#.}
                <tr>
                        <td>{.frame}</td>
                        <td> {@decimal key="I0" decimals=1}{/decimal}</td>                        
                        <td>{@decimal key="Rg" decimals=1}{/decimal}</td>    
                        <td>{@decimal key="Mass" decimals=1}{/decimal}</td>                          
                        <td> <a href="{.downloadURL}">
                                <span class="glyphicon glyphicon-download" style='font-size:14px;'></span>
                            </a>  </td> 
                </tr>
                {/.}
            </table>
        </div>
    </div>
</div>