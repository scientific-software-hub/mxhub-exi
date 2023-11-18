<br />
<div class="container-fluid containerWithScroll" >
    <div class="row">
        <div class="col-xs-12 col-md-12">
            <button class="btn btn-primary btn-xs crystal-add">Add</button>
            <table class="table" style='border:1px solid #f5f5f5;'>
              <thead>
               
   
                <tr  style='text-align:center;background-color:#f5f5f5'>
                    <th style='width:40px'></th>
                    <th style='width:40px'>Space Group</th>
                    <th style='width:20px'>a</th>
                    <th style='width:20px'>b</th>
                    <th style='width:20px'>c</th>
                    <th style='width:20px'>&#945</th>
                    <th style='width:20px'>&#946</th>
                    <th style='width:20px'>&#947</th>                                     
                    <th></th>  
                    <th>Structures</th>                     
                </tr>
                </thead>
                 <tbody>
            {#.}               
                 <tr>
                    <td><button class="btn btn-primary btn-xs crystal-edit" id={.crystalId}>Edit</button></td>
                    <td>{.spaceGroup}</td>
                    <td>{.cellA}</td>
                    <td>{.cellB}</td>
                    <td>{.cellC}</td>
                    <td>{.cellAlpha}</td>
                    <td>{.cellBeta}</td>
                    <td>{.cellGamma}</td> 
                    <td> <button class="btn btn-success btn-xs new-structure" id='{.crystalId}'>Add Structure</button></td> 
                    <td>
                       
                        
                         {@gt key=structure3VOs.length value=0}
                             <table class="table table-hover">
                                <thead>
                                    <tr style='text-align:center;background-color:#e6e6e6'>
                                        <th>Group</th>
                                        <th>Type</th>
                                        <th>File</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                {#.structure3VOs}      
                                <tr>    
                                        <td>{.groupName}</td>
                                        <td>{.structureType}</td>
                                        <td>{.name}</td>
                                        <td><button class="btn btn-danger btn-xs remove-structure" crystalId='{.crystalId}' id='{.structureId}'>Remove  </button></td> 
                                </tr>
                                {/.structure3VOs}
                            </table>
                            {:else}
                                <span style='color:gray;'>No structures defined yet</span>
                        {/gt}
                       
                    </td>                                       
                </tr>
                    
                   
             {/.}
             </tbody>    
             </table>
        </div>
    </div>
</div>