

<tr id="{.AutoProcIntegration_dataCollectionId}-{.AutoProcIntegration_autoProcIntegrationId}" style='COLOR:GRAY;background-color:#FFFFFF;width:25px;' class='autoprocintegrationrow'>
	<td >
		  {@eq key=v_datacollection_summary_phasing_anomalous type="boolean" value="true"}
			<kbd style="FONT-FAMILY:helvetica, arial, verdana, sans-serif;background-color:GRAY">ANOM</kbd>		                       
		  {/eq} 
	</td>
	<td >{.v_datacollection_processingPrograms}</td>
	<td colspan="20" align="center" > <kbd style="background-color:RED">{.processingStatus}</kbd></td>
</tr>
