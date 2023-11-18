function PuckValidator(){
	
}

/**
* Check the uniqueness of proteinId + sampleName with the already created samples or within the shipment
* If containerId is the same then protein + sampleName + containerId should match
*
* @method checkSampleNames
* @param {Array} sampleNames Array with the sample names from table
* @param {Array} proteinIds Array with the proteinIds from table
* @param {Array} proposalSamples Array containing all samples of the proposal. At least it should contain: BLSample_name and Protein_proteinId keys
* @return {Boolean} Returns an array of sample names that conflicts with either same name of the shipment or from the proposal
*/
PuckValidator.prototype.checkSampleNames = function(sampleNames, proteinIds, containerId, proposalSamples){		
    var conflicts = [];

	 /** Add a conflict if two samples have got the same name and the same proteinId within the shipment */
	 var samples = [];
	 for(var i=0; i < sampleNames.length; i++){		
		 samples.push({name : sampleNames[i], proteinId: proteinIds[i]});
	 }

	 for(var i=0; i < sampleNames.length; i++){		
		var sameSampleName = (_.filter(samples, { 'name': samples[i].name, 'proteinId': samples[i].proteinId }));
		if (sameSampleName.length > 1){			
			conflicts = conflicts.concat(sameSampleName[0].name);
			break;
		}
	 }
	 
	 for(var i=0; i < sampleNames.length; i++){		
		 var conflict = _.find(proposalSamples, {BLSample_name:  sampleNames[i], Protein_proteinId:  proteinIds[i] });
		 if (conflict){
			 /** Are the same samples, same container Id? */
			 if (conflict.Container_containerId != containerId){			 
			 	conflicts.push(sampleNames[i]);
			 }
		 }
	 }
	
	 return conflicts;
	
};