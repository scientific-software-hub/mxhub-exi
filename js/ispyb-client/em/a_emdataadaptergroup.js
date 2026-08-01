/**
* This class groups the necessary data adapter for MX as technique
* It contains: AutoProcIntegrationDataAdapter, DataCollectionDataAdapter, CrystalDataAdapter, ProteinDataAdapter, WorkflowStepDataAdapter, and PhasingDataAdapter
*
* @class MxDataAdapterFactory
* @constructor
*/

function EmDataAdapterGroup(args){	
	this.dataCollection = new EmDataCollectionDataAdapter(args);
	
}



// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.EmDataAdapterGroup = EmDataAdapterGroup;
