function OnlineResultSectionDataCollection(args) {
	
	this.noFoundClass = "summary_datacollection_noFound";
	this.failedClass = "summary_datacollection_failed";
	this.successClass = "summary_datacollection_success";
}


OnlineResultSectionDataCollection.prototype.getScreeningData = function(dataCollectionGroup){
    var items = [];
     
	var parsed = [];
	if (dataCollectionGroup.Screening_screeningId != null){
		if (dataCollectionGroup.ScreeningOutput_indexingSuccess){
            items.push({
                name   : "Indexing",
                status : "Success",
                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                items  : [
                    {
                        name  : 'Mosaicity',
                        value : dataCollectionGroup.ScreeningOutput_mosaicity,
                        units : 'º'
                    }
                ]
            });

		}
		else{
			 items.push({
                name   : "Indexing",
                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                status : "Failure",
                items  : []
            });
		}
    }
   /* else{
        items.push({
                name   : "No indexing",
                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                status : "Not found",
                items  : []
            });
    }*/
    
    if (dataCollectionGroup.ScreeningOutput_strategySuccess){
           var subItems = [ {
                        name  : 'Ranking Res.',
                        value : dataCollectionGroup.ScreeningOutput_rankingResolution,
                        units : 'Å'
                    },                              
           ];
        if (dataCollectionGroup.ScreeningOutputLattice_spaceGroup){  
           subItems.push( {
                            name : 'Space Group',
                            value : dataCollectionGroup.ScreeningOutputLattice_spaceGroup,
                            units : ''
		   });
           subItems.push( {
                            name : 'a,b,c',
                            value : dataCollectionGroup.ScreeningOutputLattice_unitCell_a + ", " + dataCollectionGroup.ScreeningOutputLattice_unitCell_b + ", " + dataCollectionGroup.ScreeningOutputLattice_unitCell_c,
                            units : ''
		   });
           
           subItems.push( {
                            name : 'α β γ',
                            value : dataCollectionGroup.ScreeningOutputLattice_unitCell_alpha + ", " + dataCollectionGroup.ScreeningOutputLattice_unitCell_beta + ", " + dataCollectionGroup.ScreeningOutputLattice_unitCell_gamma,
                            units : ''
            });      		                     				
			                     
        }
         items.push({
                name   : "Strategy",
                status : "Success",
                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                items  : subItems 
         });	
    }
   /* else{
        items.push({
            name   : "No strategy",
            status : "Not found",
            datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
            items  : []
        });
    }*/
        
    
    /** No autprocessing */
   if (items.length == 0){
            return {
            name               :"Screening",
            status             : "Not found",
            items : []
                
        };
    }

    var status = "Failure";
    for (var i = 0; i < items.length; i++) {
        if (items[i].status == "Success"){
            status = "Success";
        }
        
    }
    return {
          name : "Screening",
          status :status,
          items : items  
    };           
};



OnlineResultSectionDataCollection.prototype.getAutoprocResults = function(dataCollectionGroup) {
   /** Paring autoprocessing */
    var autoprocessing = [];    
    var programs = dataCollectionGroup.processingPrograms; 
    var results = dataCollectionGroup.processingStatus;
    var spaceGroups = dataCollectionGroup.AutoProc_spaceGroups;
    
	if (programs != null){
		programs = programs.split(",");
		results = results.split(",");
        spaceGroups = spaceGroups.split(",");
		
        var aux = {};
		for (var i= 0; i < programs.length; i++){
			var name = programs[i].trim();
          
			if (aux[name] == null){
				aux[name] = {};
                aux[name]["spaceGroup"] = [];
				aux[name]["run"] = 0;
				aux[name]["success"] = 0;    
			}
            aux[name]["spaceGroup"].push(spaceGroups[i]);
			aux[name]["run"] =  aux[name]["run"] + 1;
			aux[name]["success"] =  aux[name]["success"]  + 1;
		}
        
        
            
        for (var key in aux){
            var status = "Failure";
            if (aux[key].success > 0){
                status = "Success";
            }
            
            autoprocessing.push({
               name     : key,
               dataCollectionId     : dataCollectionGroup.DataCollection_dataCollectionId,
               run      :  aux[key].run,
               success  :  aux[key].success,
               spaceGroup  :  aux[key].spaceGroup,
               status   : status,
               items   : [] 
            });
        }
	}
    
    /** Adding autoprocessing to results or add no autprocessing if any*/
    if (autoprocessing.length > 0){
       return {
                                name                : "Autoprocessing",
                                items               : autoprocessing,
                                status              : "Success",
                                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId
        };
    }
    else{
        return {
                                name                : "Autoprocessing",
                                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                                 status             : "Not found",
                                items : [
                                    /*{
                                       name     : "No autoprocessing",
                                       status   : "Not found",
                                       items    : []
                                }*/
                                ]
        };
    }
};

OnlineResultSectionDataCollection.prototype.getPhasingResults = function(dataCollectionGroup) {
    if (dataCollectionGroup!= null){
		if (dataCollectionGroup.Phasing_phasingStepType != null){
             return {
                                name : "Phasing",
                                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                                items : [{
                                       name     : "Phasing",
                                       status   : "Success",
                                       items    : []
                                }]
            };
        }
        else{
            return {
                                name : "Phasing",
                                datacollectionId    : dataCollectionGroup.DataCollection_dataCollectionId,
                                items : [{
                                       name     : "No phasing",
                                       status   : "Not found",
                                       items    : []
                                }]
            };
        }
    }
};
OnlineResultSectionDataCollection.prototype.parseData = function(dataCollectionGroup) {
	var resultParsed = [];
    resultParsed.push(this.getAutoprocResults(dataCollectionGroup));
    resultParsed.push(this.getScreeningData(dataCollectionGroup));
    //resultParsed.push(this.getPhasingResults(dataCollectionGroup));
	return resultParsed;
};


OnlineResultSectionDataCollection.prototype.getHTML = function(dataCollectionGroup, autoProcResults){
    var parseResults = this.parseData(dataCollectionGroup);

    parseResults[0].autoProcResults = autoProcResults;
    var html = "";
    dust.render("resultsection.autoprocessing", parseResults, function(err, out) {
        html = out;
        
    });
       
                                        
    return html;	
};


OnlineResultSectionDataCollection.prototype.getPhasingHTML = function(dataCollectionGroup){
	var html= "";
	if (dataCollectionGroup!= null){
		if (dataCollectionGroup.Phasing_phasingStepType != null){
			var steps = dataCollectionGroup.Phasing_phasingStepType.split(",");
			var parsed = [];
			for (var i = 0; i < steps.length; i++) {
				parsed.push({
					iconClass : "summary_datacollection_success",
					value : steps[i]
					
				});
			}
			html = html + this.getIconTable(parsed);
		}
		else{
			html = html + this.getIconTable([{
				iconClass : "summary_datacollection_noFound",
				value : "Phasing"
			}]);
		}
		
		if (dataCollectionGroup.Phasing_spaceGroup != null){
			html = html + this.getHTMLTable([{
            	key : 'Space Groups',
 				value : dataCollectionGroup.Phasing_spaceGroup 
             }]);
		}
	}
	return html;
};
