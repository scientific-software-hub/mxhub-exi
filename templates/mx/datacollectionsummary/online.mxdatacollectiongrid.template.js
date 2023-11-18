
        
<br />
<div class="container-fluid">
    <div class="row">     
        <div class="col-sm-2 col-md-4 " style='margin: 0 10px 10px 0;'>    </div>        
        {! AUTOPROCESSING !}
            {#.autoprocessing}
                <div class="col-sm-2 col-md-1 " style='margin: 0 10px 10px 0;'>                                  
                            <div class="dropup">
                                {@eq key=items.length value=0}
                                    <button class="btn btn-xs btn-warning dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-cog"></span>  Processing <span class="badge">{@size key=items /}</span><span class="caret"></span></button>
                                {/eq}                        
                                {@gt key=items.length value=0}  
                                    <button class="btn btn-xs btn-success dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-cog"></span>  Processing <span class="badge">{@size key=items /}</span><span class="caret"></span></button>  
                                    <ul class="dropdown-menu">
                                            {#.}
                                                {#.items}
                                                    <li> 
                                                        {@eq key=status value="Success"}  <div class='summary_datacollection_success'></div>{.name} {/eq}
                                                        {@ne key=status value="Success"}  <div class='summary_datacollection_failed'></div>{.name} {/ne}
                                                    </li> 
                                                {/.items}
                                            {/.} 
                                             {#.}
                                                {#.items[0]}
                                                    <li class="divider"></li>
                                                        <li >                                                                                                  
                                                            <div class="btn-group btn-group-xs" style='margin:0 0 0 30px;'>                                                                
                                                                    <a href="#/autoprocintegration/datacollection/{.dataCollectionId}/main" class="btn btn-default" role="button"> <span class="glyphicon glyphicon-eye-open"></span> Open</a>
                                                                    <a href="#/autoprocintegration/datacollection/{.dataCollectionId}/files" style='margin:0 0 0 10px;' class="btn btn-default" role="button"> <span class="glyphicon glyphicon-file">Files</span></a>
                                                            </div>
                                                        </li>  
                                                 {/.items[0]}
                                            {/.}  
                                        </ul>
                                {/gt}
                            </div>
                </div>
            {/.autoprocessing}



             {! SCREENING !}
            {#.screening}
                <div class="col-sm-2 col-md-1 " style='margin: 0 10px 10px 0;'>                                  
                            <div class="dropup">
                                {@eq key=items.length value=0}
                                    <button class="btn btn-xs btn-warning dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-screenshot"></span> Characterization <span class="badge">{@size key=items /}</span><span class="caret"></span></button>
                                {/eq}                        
                                {@gt key=items.length value=0}  
                                    {@eq key=status value="Success"}
                                        <button class="btn btn-xs btn-success dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-screenshot"></span> Characterization <span class="badge">{@size key=items /}</span><span class="caret"></span></button>
                                    {/eq} 
                                    {@ne key=status value="Success"}
                                        <button class="btn btn-xs btn-danger dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-screenshot"></span> Characterization <span class="badge">{@size key=items /}</span><span class="caret"></span></button>
                                    {/ne}  
                                    <ul class="dropdown-menu">
                                            {#.}
                                                {#.items}
                                                    <li> 
                                                    {@eq key=status value="Success"}  <div class='summary_datacollection_success'></div>{.name} {/eq}
                                                    {@ne key=status value="Success"}  <div class='summary_datacollection_failed'></div>{.name} {/ne}
                                                    
                                                     <table class="table"  style='margin:0 0 20 0px;'>
                                                         {#.items}
                                                            <tr>
                                                                <td>{.name}</td>
                                                                <td>{.value}</td>
                                                            </tr>    
                                                         {/.items}
                                                     </table>                                                                                                                 
                                                    </li> 
                                                {/.items}                                                
                                            {/.}    
                                        </ul>
                                {/gt}
                            </div>
                </div>
            {/.screening}

            	
            {! WORKFLOWS !}
            <div class="col-sm-2 col-md-1 " style='margin: 0 10px 10px 0;'>                                
                            
                    <div class="dropup">
                        {@eq key=workflows.length value=0}
                            <button class="btn btn-xs btn-warning dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-sort-by-attributes"></span>Workflow <span class="badge">{@size key=workflows /}</span><span class="caret"></span></button>
                        {/eq}
                        
                        {@gt key=workflows.length value=0}
                                <button class="btn btn-xs btn-success dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-sort-by-attributes"></span>Workflow <span class="badge">{@size key=workflows /}</span><span class="caret"></span></button>
                                <ul class="dropdown-menu">
                                {#.workflows} 
                                    {#.}
                                        {@eq key=status value="Success"}
                                            <li> 
                                                            {@eq key=status value="Success"} <img  src='{.img}' style='width:30px;height:30px;'/><div class='summary_datacollection_success'></div>{.name}{/eq}
                                                            {@ne key=status value="Success"} <img src='{.img}' style='width:30px;height:30px;'/><div class='summary_datacollection_failed'></div>{.name}{/ne}
                                            </li>                                                                                       
                                        {/eq}                                                                                                                                                                                                                                                            
                                        {@ne key=status value="Success"}
                                            <li>
                                                    {@eq key=status value="Success"}<img  src='{.img}' style='width:30px;height:30px;'/><div class='summary_datacollection_success'></div> {.name} {/eq}
                                                    {@ne key=status value="Success"}<div class='summary_datacollection_failed'></div {.name} {/ne}
                                            </li>                                                                                       
                                        {/ne}
                                    {/.}  
                                                       
                                {/.workflows} 
                                {#.workflows[0]}
                                     <li class="divider"></li>
                                                        <li >
                                                        
                                          
                                                            <div class="btn-group btn-group-xs" style='margin:0 0 0 30px;'>
                                                                    <a href="#/mx/workflow/step/{.workflowStepIds}/main" class="btn btn-default" role="button"> <span class="glyphicon glyphicon-eye-open"></span>Open</a>
                                                            </div>
                                                        </li>  
                                {/.workflows[0]}  
                                </ul>
                        {/gt}
                    </div>                            
            </div>
            
            
               
            
              {! OFFLINE 
            <div class="col-sm-2 col-md-1 " style='margin: 0 10px 10px 0;'>                                
                            
                    <div class="dropup">
                       
                        
                      
                                <button class="btn btn-xs btn-success dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-triangle-right"></span>Run <span class="caret"></span></button>
                                <ul class="dropdown-menu">                               
                                            <li style='margin:0 0 0 10px;'> <a class="brand" href='#/tool/reprocess/datacollection/{.DataCollection_dataCollectionId}/{.DataCollection_startImageNumber}/{.DataCollection_numberOfImages}/main'><span class="glyphicon glyphicon-refresh"></span><span  style='margin:0 0 0 10px;'>Reprocess: It reprocess the images based in a defined range</span></a></li>                                                               
                                            <li style='margin:0 0 0 10px;'> <a class="brand" href='#/tool/dimple/datacollection/{.DataCollection_dataCollectionId}/main'><span class="glyphicon glyphicon-certificate"></span><span  style='margin:0 0 0 10px;'>Dimple: DIMPLE is an automated software pipeline for rapidly processing crystals that contain a known protein and possibly a ligand bound to this protein</span></a></li>                        
                                        
                                </ul>
                      
                      </div>                         
            </div>
            !}
             <div class="col-sm-2 col-md-2 " style='margin: 0 10px 10px 0;'> 
                {@gt key=phasingStepLength value=0}
                       
                {/gt}
            </div>
              
              
            
             
            
    </div>   
</div>                                                                                                                             

