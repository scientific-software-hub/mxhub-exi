
{#prepare}
    <span style='font-size:12px;'>
        {.spaceGroup} ({.spaceGroupShortName})
   </span>  
{/prepare}

<br />

{#prepare}
    {@eq key=status value="Success"}<div class='summary_datacollection_success'></div>{/eq}
    {@eq key=status value="Failure"}<div class='summary_datacollection_failed'></div>{/eq}
    {@eq key=status value="Not found"}<div class='summary_datacollection_noFound'></div>{/eq}
                       
    {.type}
{/prepare}

<br />
{#substructure}

    {@eq key=status value="Success"}<div class='summary_datacollection_success'></div>{/eq}
    {@eq key=status value="Failure"}<div class='summary_datacollection_failed'></div>{/eq}
    {@eq key=status value="Not found"}<div class='summary_datacollection_noFound'></div>{/eq}
   
   {@gt key=runs value=0} 
        {.type}  <span style='color:gray;font-size:10px'>({.runs} runs)</span> 
   {/gt}
   {@eq key=runs value=0} 
         <span style='color:gray;font-size:10px'> {.type} ({.runs} runs)</span> 
   {/eq}
   
{/substructure}

<br />
{#phasing}
  {@eq key=status value="Success"}<div class='summary_datacollection_success'></div>{/eq}
  {@eq key=status value="Failure"}<div class='summary_datacollection_failed'></div>{/eq}
  {@eq key=status value="Not found"}<div class='summary_datacollection_noFound'></div>{/eq}
   
   {@gt key=runs value=0} 
        {.type}  <span style='color:gray;font-size:10px'>({.runs} runs)</span> 
   {/gt}
   {@eq key=runs value=0} 
         <span style='color:gray;font-size:10px'> {.type} ({.runs} runs)</span> 
   {/eq}
   
   {@gt key=runs value=0}   
        {#stats}
                <table style='margin-left:30px;'>
                    <tr>
                        <td> {.successCondition} runs with successful stats</td>
                    </tr>
                    <tr>
                        <td> {.withStatistics} runs with statistics</td>
                    </tr>
                    <tr>
                        <td> {.withoutStatistics} runs with no statistics</td>
                    </tr>
                </table>
                
        {/stats}
   {/gt}
  
   
{/phasing}

<br />
{#models}
  {@eq key=status value="Success"}<div class='summary_datacollection_success'></div>{/eq}
  {@eq key=status value="Failure"}<div class='summary_datacollection_failed'></div>{/eq}
  {@eq key=status value="Not found"}<div class='summary_datacollection_noFound'></div>{/eq}
   
    {@gt key=runs value=0} 
        {.type}  <span style='color:gray;font-size:10px'>({.runs} runs)</span> 
   {/gt}
   {@eq key=runs value=0} 
         <span style='color:gray;font-size:10px'> {.type} ({.runs} runs)</span> 
   {/eq}
{/models}
<br />
<br />