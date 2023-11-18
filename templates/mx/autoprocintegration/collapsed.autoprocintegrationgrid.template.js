<div class="container-fluid">
   <div class="row">
      <div class="col-xs-12 col-md-2">

         <table class="table table-striped table-hover">
            <thead>
               <tr>                                   
                  <th></th>
                  <th>Pipeline</th>
                  <th>SpaceGroup</th>
                  <th>a,b,c (&#197;)</th>
                  <th>&#x3B1;,&beta;,&gamma; (&deg)</th>
                  <th>Shell</th> 
                  <th>Resolution (&#197;)</th>
                  <th>Multiplicity</th>
                  <th>Completeness %</th> 
                  <th>Anomalous<br>multiplicity</th>
                  <th>Anomalous<br>completeness %</th> 
                  <th>&#60;I/Sigma&#62;</th>
                  <th>Rmeas</th> 
                  <th>Rmerge</th>
                  <th>Rpim</th>
                  <th>cc(1/2)</th> 
                  <th>ccAno</th>
                  <th>sigAno</th>
                  <th>ISA</th>
                  <th>Download</th>
                  <th></th>
               </tr>
            </thead>  
            {#.}
                  {@select key=processingStatus}
                        {@eq value="SUCCESS"} {>"success.collapsed.autoprocintegrationgrid.template" /}  {/eq}
                        {@eq value="RUNNING"} {>"running.collapsed.autoprocintegrationgrid.template" /} {/eq}
                        {@eq value="FAILED"} {>"failed.collapsed.autoprocintegrationgrid.template" /} {/eq}
                        {@eq value="TIMEOUT"} {>"timeout.collapsed.autoprocintegrationgrid.template" /} {/eq}
                        {@eq value="1"} {>"success.collapsed.autoprocintegrationgrid.template" /} {/eq}
                        {@eq value="0"} {>"failed.collapsed.autoprocintegrationgrid.template" /} {/eq}
                  {/select}

            {/.}
         </table>  
        
      </div>
   </div>
</div>
