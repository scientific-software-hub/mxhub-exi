/**
* API for protein
*
* @class ProteinDataAdapter
* @constructor
*/
function ProteinDataAdapter(args){
	DataAdapter.call(this, args);
}

ProteinDataAdapter.prototype.get = DataAdapter.prototype.get;
ProteinDataAdapter.prototype.post = DataAdapter.prototype.post;
ProteinDataAdapter.prototype.getUrl = DataAdapter.prototype.getUrl;

/**
* @method getProteinByProposalId
*/
ProteinDataAdapter.prototype.getProteinByProposalId= function(){
	 this.get('/{token}/proposal/{proposal}/mx/protein/list');
};

/**
* @method getProteinByProposalId
*/
ProteinDataAdapter.prototype.getProteinStatsByProposalId= function(){
	 this.get('/{token}/proposal/{proposal}/mx/protein/stats');
};

/**
* @method saveProtein
*/
ProteinDataAdapter.prototype.saveProtein= function(protein){
	 this.post(('/{token}/proposal/{proposal}/mx/protein/save'), protein);
};










// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.ProteinDataAdapter = ProteinDataAdapter;
