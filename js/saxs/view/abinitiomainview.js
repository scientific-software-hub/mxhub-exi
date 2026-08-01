function AbinitioMainView() {		
	MainView.call(this);
				
	/** Abinitio **/
	this.abinitioForm = new AbinitioForm({
		height : 700
	});	
}


AbinitioMainView.prototype.getPanel = function() {
	return this.abinitioForm.getPanel()
};

AbinitioMainView.prototype.load = function(dataCollectionId) {
	var _this = this;
	
	var onSuccess = function (sender, dataCollections) {        
		if (dataCollections){
            if (dataCollections[0].Subtraction_subtractionId){
                   var onSuccessSubtraction = function(sender, subtractions) {  					                  
                        _this.abinitioForm.load(subtractions);
                    };			
                    EXI.getDataAdapter({onSuccess : onSuccessSubtraction}).saxs.subtraction.getSubtractionsBySubtractionIdList([dataCollections[0].Subtraction_subtractionId]);	                  
            }
        }
	}
	EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsById(dataCollectionId);
};


// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.AbinitioMainView = AbinitioMainView;
