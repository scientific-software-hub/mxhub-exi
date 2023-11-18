function DewarDataAdapter(args){
	DataAdapter.call(this, args);
}

DewarDataAdapter.prototype.get = DataAdapter.prototype.get;
DewarDataAdapter.prototype.post = DataAdapter.prototype.post;
DewarDataAdapter.prototype.getUrl = DataAdapter.prototype.getUrl;

DewarDataAdapter.prototype.saveDewar= function(shippingId, dewar){
	this.post( ('/{token}/proposal/{proposal}/shipping/{0}/dewar/save'.format( [shippingId])), dewar);
};

DewarDataAdapter.prototype.removeDewar= function(shippingId, dewarId){
	this.get(('/{token}/proposal/{proposal}/shipping/{0}/dewar/{1}/remove'.format( [shippingId, dewarId])));
};

DewarDataAdapter.prototype.addDewar= function(shippingId){
   this.saveDewar(shippingId, {});
};

DewarDataAdapter.prototype.getDewarsByProposal = function(){
	this.get('/{token}/proposal/{proposal}/dewar/list');
};

DewarDataAdapter.prototype.getDewarsByStatus = function(status){
	this.get(('/{token}/proposal/{proposal}/dewar/status/{0}/list'.format( [status])));
};

DewarDataAdapter.prototype.getDewarsBySessionId = function(sessionId){
	this.get('/{token}/proposal/{proposal}/dewar/session/{0}/list'.format( [sessionId]));
};

DewarDataAdapter.prototype.updateSampleLocation = function(containerIdList, beamlineList, sampleLocation){
    var url = '/{token}/proposal/{proposal}/container/{0}/beamline/{1}/samplechangerlocation/update'.format( [containerIdList,beamlineList]);
    this.post(url, {sampleChangerLocation : sampleLocation.join()});
};

DewarDataAdapter.prototype.emptySampleLocation = function(containerIdList){
    var url = '/{token}/proposal/{proposal}/container/{0}/samplechangerlocation/empty'.format([containerIdList]);
    this.post(url);
};

/**
* This method export a pdf list of the sample in the given dewars
* @method exportPDF
* @param dewarIdList
* @param sortView [1: sort by acronym/sample name, 2: sort by dewar/container/location]
*/
DewarDataAdapter.prototype.exportPDF = function(dewarIdList,sortView) {
	return this.getUrl('/{token}/proposal/{proposal}/mx/sample/dewar/{0}/sortView/{1}/list/pdf'.format( [dewarIdList,sortView]));
};




