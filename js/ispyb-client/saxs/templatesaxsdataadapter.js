function TemplateSaxsDataAdapter(args){
	DataAdapter.call(this, args);
}

TemplateSaxsDataAdapter.prototype.get = DataAdapter.prototype.get;
TemplateSaxsDataAdapter.prototype.post = DataAdapter.prototype.post;
TemplateSaxsDataAdapter.prototype.getUrl = DataAdapter.prototype.getUrl;


TemplateSaxsDataAdapter.prototype.getTemplateSourceFile = function(experimentId, type){
	return this.getUrl('/{token}/proposal/{proposal}/saxs/experiment/{0}/samplechanger/type/{1}/template'.format([  experimentId, type]));
};


TemplateSaxsDataAdapter.prototype.saveTemplate = function(name, comments, measurements, experimentId ){
    var url = ('/{token}/proposal/{proposal}/saxs/experiment/save');
	this.post(url, {name : name,
					comments : comments,
					experimentId : experimentId,
					measurements : measurements.toString()
	});
};


// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.TemplateSaxsDataAdapter = TemplateSaxsDataAdapter;
