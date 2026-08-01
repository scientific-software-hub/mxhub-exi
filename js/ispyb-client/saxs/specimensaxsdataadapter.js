function SpecimenSaxsDataAdapter(args){
	DataAdapter.call(this, args);
}

SpecimenSaxsDataAdapter.prototype.get = DataAdapter.prototype.get;
SpecimenSaxsDataAdapter.prototype.post = DataAdapter.prototype.post;
SpecimenSaxsDataAdapter.prototype.getUrl = DataAdapter.prototype.getUrl;

SpecimenSaxsDataAdapter.prototype.saveSpecimen= function(specimen){
    var url = ('/{token}/proposal/{proposal}/saxs/specimen/save');
	this.post(url, {specimen : JSON.stringify(specimen)});
};

SpecimenSaxsDataAdapter.prototype.mergeSpecimens= function(sourceSpecimenId, targetSpecimenId){
    var url = ('/{token}/proposal/{proposal}/saxs/specimen/merge');
	this.post(url, {sourceSpecimenId : sourceSpecimenId, targetSpecimenId : targetSpecimenId });
};

// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.SpecimenSaxsDataAdapter = SpecimenSaxsDataAdapter;
