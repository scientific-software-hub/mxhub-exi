
 {@lt key=innerShell.rMerge value=10}
		        {?label}
		            {@eq key=label value="BEST"}
		                <tr id="{.AutoProcIntegration_dataCollectionId}-{.AutoProcIntegration_autoProcIntegrationId}" style='background-color:#e6ffe6;' class='autoprocintegrationrow'>

		            {:else} 
		                <tr id="{.AutoProcIntegration_dataCollectionId}-{.AutoProcIntegration_autoProcIntegrationId}" style='background-color:#ffffff;' class='autoprocintegrationrow'>
		            {/eq}
		        {:else}    
		            <tr id="{.AutoProcIntegration_dataCollectionId}-{.AutoProcIntegration_autoProcIntegrationId}"  class='autoprocintegrationrow'>
		        {/label}  
		    {:else}
		        <tr id="{.AutoProcIntegration_dataCollectionId}-{.AutoProcIntegration_autoProcIntegrationId}" style='background-color:#ffe6e6;width:25px;' class='autoprocintegrationrow'>
		    {/lt}
		        <td >
		          {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
		                <kbd style="FONT-FAMILY:helvetica, arial, verdana, sans-serif;background-color:#337ab7">ANOM</kbd>
		                <BR />
		          {:else}                        
		          {/eq}
		         
		        
		       
		       
		        {?label}
		            {@eq key=label value="BEST"}
		                <br /><kbd style="background-color:green">{.label}</kbd>
		            {:else}
		                 <br /><kbd style="background-color:orange">{.label}</kbd>
		            {/eq}
		       {:else}
		            {.rank}
		       {/label}
		       </td>

		       <td >
		                <a href='#/autoprocintegration/datacollection/{.AutoProcIntegration_dataCollectionId}/autoprocIntegration/{.AutoProcIntegration_autoProcIntegrationId}/main' target='_blank'> {.v_datacollection_processingPrograms}</a>		               
		       </td>
		       <td >{.v_datacollection_summary_phasing_autoproc_space_group}</td>
		      
		       <td >{@decimal key="v_datacollection_summary_phasing_cell_a" decimals=1}{/decimal}<br>{@decimal key="v_datacollection_summary_phasing_cell_b" decimals=1}{/decimal}<br>{@decimal key="v_datacollection_summary_phasing_cell_c" decimals=1}{/decimal}</td>
		       <td >{@decimal key="v_datacollection_summary_phasing_cell_alpha" decimals=1}{/decimal}<br>{@decimal key="v_datacollection_summary_phasing_cell_beta" decimals=1}{/decimal}<br>{@decimal key="v_datacollection_summary_phasing_cell_gamma" decimals=1}{/decimal}</td>
		       <td>
		          <span class='overallshell'>Overall</span><br />
		          <span class='innershell'>Inner</span><br />
		          <span class='outershell'>Outer</span>
		       </td>
		       <td >
		          <span class='overallshell'>{.overall.resolutionLimitLow}-{.overall.resolutionLimitHigh} </span><br />
		          <span class='innershell'>{.innerShell.resolutionLimitLow}-{.innerShell.resolutionLimitHigh} </span><br />
		          <span class='outershell'>{.outerShell.resolutionLimitLow}-{.outerShell.resolutionLimitHigh}</span>
		       </td>
		       <td >
		          {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
		              {?overall.anomalousMultiplicity}
		                 {?overall.multiplicity}
		                     {?overall.completeness}
			                      <span class='overallshell'>{.overall.multiplicity}</span><br />
			                      <span class='innershell'>{.innerShell.multiplicity} </span><br />
			                      <span class='outershell'>{.outerShell.multiplicity}</span>
		                      {:else}
		                          <span class='overallshell'></span><br />
		                          <span class='innershell'></span><br />
		                          <span class='outershell'></span>
		 		              {/overall.completeness}
		 		          {:else}
	                          <span class='overallshell'></span><br />
	                          <span class='innershell'></span><br />
	                          <span class='outershell'></span>
			              {/overall.multiplicity}
	 		          {:else}
                          <span class='overallshell'></span><br />
                          <span class='innershell'></span><br />
                          <span class='outershell'></span>
                      {/overall.anomalousMultiplicity}
                  {:else}
	                  <span class='overallshell'>{.overall.multiplicity}</span><br />
	                  <span class='innershell'>{.innerShell.multiplicity} </span><br />
	                  <span class='outershell'>{.outerShell.multiplicity}</span>
                  {/eq}
		       </td>
		       <td > 
		          {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
		              {?overall.anomalousCompleteness}
		                 {?overall.multiplicity}
	                     {?overall.completeness}
		                      <span class='overallshell'>{.overall.completeness}</span><br />
		                      <span class='innershell'>{.innerShell.completeness} </span><br />
		                      <span class='outershell'>{.outerShell.completeness}</span>
	                      {:else}
	                          <span class='overallshell'></span><br />
	                          <span class='innershell'></span><br />
	                          <span class='outershell'></span>
	 		              {/overall.completeness}
	 		          {:else}
                          <span class='overallshell'></span><br />
                          <span class='innershell'></span><br />
                          <span class='outershell'></span>
		              {/overall.multiplicity}
 		          {:else}
                      <span class='overallshell'></span><br />
                      <span class='innershell'></span><br />
                      <span class='outershell'></span>
                      {/overall.anomalousCompleteness}
                   {:else}
	                  <span class='overallshell'>{.overall.completeness}</span><br />
	                  <span class='innershell'>{.innerShell.completeness} </span><br />
	                  <span class='outershell'>{.outerShell.completeness}</span>
                  {/eq}
		       </td>
		       <td >
		          {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
	                  {?overall.anomalousMultiplicity}
		                  <span class='overallshell'>{.overall.anomalousMultiplicity}</span><br />
		                  <span class='innershell'>{.innerShell.anomalousMultiplicity} </span><br />
		                  <span class='outershell'>{.outerShell.anomalousMultiplicity}</span>
		              {:else}
		                  <span class='overallshell'>{.overall.multiplicity}</span><br />
		                  <span class='innershell'>{.innerShell.multiplicity} </span><br />
		                  <span class='outershell'>{.outerShell.multiplicity}</span>
		              {/overall.anomalousMultiplicity}
                  {:else}
	                  <span class='overallshell'>{.overall.anomalousMultiplicity}</span><br />
	                  <span class='innershell'>{.innerShell.anomalousMultiplicity} </span><br />
	                  <span class='outershell'>{.outerShell.anomalousMultiplicity}</span>
	              {/eq}
		       </td>
		       <td >
		          {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
		              {?overall.anomalousCompleteness}
	                      <span class='overallshell'>{.overall.anomalousCompleteness}</span><br />
	                      <span class='innershell'>{.innerShell.anomalousCompleteness} </span><br />
	                      <span class='outershell'>{.outerShell.anomalousCompleteness}</span>
			          {:else}
		                  <span class='overallshell'>{.overall.completeness}</span><br />
		                  <span class='innershell'>{.innerShell.completeness} </span><br />
		                  <span class='outershell'>{.outerShell.completeness}</span>
		              {/overall.anomalousCompleteness}
                  {:else}
	                  <span class='overallshell'>{.overall.anomalousCompleteness}</span><br />
	                  <span class='innershell'>{.innerShell.anomalousCompleteness} </span><br />
	                  <span class='outershell'>{.outerShell.anomalousCompleteness}</span>
	              {/eq}
		       </td>
		       <td >
		            <span class='overallshell'>{.overall.meanIOverSigI}</span><br />
		            <span class='innershell'>{.innerShell.meanIOverSigI} </span><br />
		            <span class='outershell'>{.outerShell.meanIOverSigI}</span>
		        </td>
		       <td >
		            <span class='overallshell'>{.overall.rMeasAllIPlusIMinus}</span><br />
		            <span class='innershell'>{.innerShell.rMeasAllIPlusIMinus} </span><br />
		            <span class='outershell'>{.outerShell.rMeasAllIPlusIMinus}</span>
		        </td>
		       <td >
		            <span class='overallshell'>{.overall.rMerge}</span><br />
		            {@lt key=innerShell.rMerge value=10}
		                <span class='innershell'>{.innerShell.rMerge} </span><br />
		            {:else}
		                <span class='innershell' style='font-weight:700;color:red;'>{.innerShell.rMerge} </span><br />
		            {/lt}
		            <span class='outershell'>{.outerShell.rMerge}</span>
		       </td>
		       <td >
		            <span class='overallshell'>{.overall.rPimWithinIPlusIMinus}</span><br />
		            <span class='innershell'>{.innerShell.rPimWithinIPlusIMinus} </span><br />
		            <span class='outershell'>{.outerShell.rPimWithinIPlusIMinus}</span>
		        </td>
		       <td >
		            {?overall.ccHalf}
		                <span class='overallshell'>{@math key=100 method="multiply" operand=overall.ccHalf/}  </span><br />
		            {/overall.ccHalf}

		            {?innerShell.ccHalf}
		                <span class='innershell'>{@math key=100 method="multiply" operand=innerShell.ccHalf/}  </span><br />
		            {/innerShell.ccHalf}

		            {?outerShell.ccHalf}
		                <span class='outershell'>{@math key=100 method="multiply" operand=outerShell.ccHalf/}  </span>
		            {/outerShell.ccHalf}
		       </td>
		       
		       <td>
		            <span class='overallshell'>{.overall.ccAno}</span> <br />
		            <span class='innershell'>{.innerShell.ccAno} </span><br />
		            <span class='outershell'>{.outerShell.ccAno}</span>
		       </td>
		       <td>
		            <span class='overallshell'>{.overall.sigAno}</span><br />
		            <span class='innershell'>{.innerShell.sigAno} </span><br />
		            <span class='outershell'>{.outerShell.sigAno}</span>    
		       </td>
		        <td  >{.isa}</td>
		       <td >
		                {?downloadFilesUrl}
		                    <a href='{.downloadFilesUrl}' ><span style='font-size: 1.5em;' class="glyphicon glyphicon-download " ></span></a>
		                {/downloadFilesUrl}
		        </td>

		        <td>
		                <button type="button" class="btn btn-sm" data-toggle="modal"><span  id="openfiles_{.v_datacollection_summary_phasing_autoProcProgramId}" class="glyphicon glyphicon-folder-close" aria-hidden="true"></span></button>
		               
		        </td>


		    </tr>
