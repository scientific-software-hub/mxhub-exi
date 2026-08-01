/**
* This class groups the necessary data adapter for MX experiments all together
* It contains: proposalDataAdapter, mxDataAdapterGroup, saxsDataAdapterGroup and exiDataAdapterGroup
*
* @class MxDataAdapterFactory
* @constructor
*/
function EmDataAdapterFactory(args){
	this.proposal = new ProposalDataAdapterGroup(args);
	this.mx = new MxDataAdapterGroup(args);
	this.saxs = new SaxsDataAdapterGroup(args);
	this.exi = new ExiDataAdapterGroup(args);
	this.em = new EmDataAdapterGroup(args);
}















































// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.EmDataAdapterFactory = EmDataAdapterFactory;
