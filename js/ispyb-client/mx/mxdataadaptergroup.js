/**
* This class groups the necessary data adapter for MX as technique
* It contains: AutoProcIntegrationDataAdapter, DataCollectionDataAdapter, CrystalDataAdapter, ProteinDataAdapter, WorkflowStepDataAdapter, and PhasingDataAdapter
*
* @class MxDataAdapterFactory
* @constructor
*/

function MxDataAdapterGroup(args){
	this.autoproc = new AutoProcIntegrationDataAdapter(args);
	this.dataCollection = new DataCollectionDataAdapter(args);
	this.crystal = new CrystalDataAdapter(args);
	this.protein = new ProteinDataAdapter(args);
	this.workflow = new WorkflowDataAdapter(args);
	this.workflowstep = new WorkflowStepDataAdapter(args);
	this.sample = new SampleDataAdapter(args);
	this.phasing = new PhasingDataAdapter(args);
    this.energyscan = new EnergyScanDataAdapter(args);
    this.xfescan = new XFEScanDataAdapter(args);
    this.stats = new StatisticsDataAdapter(args);
	this.dataCollectionGroup = new DataCollectionGroupDataAdapter(args);	
}


