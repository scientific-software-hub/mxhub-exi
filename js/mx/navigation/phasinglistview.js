/**
* PhasingListView displays the phasing steps as list on the navigation panels
*
* @class PhasingListView
* @constructor
*/
function PhasingListView(){
	this.title = "Space Groups";
	this.sorters = [{property : 'sessionId', direction: 'DESC'}];
	ListView.call(this);
}


PhasingListView.prototype.getPanel = ListView.prototype.getPanel;
PhasingListView.prototype.load = ListView.prototype.load;
PhasingListView.prototype.getFields = ListView.prototype.getFields;
PhasingListView.prototype.getColumns = ListView.prototype.getColumns;
PhasingListView.prototype.getFilter = ListView.prototype.getFilter;
/**
* Calls to the dust template in order to render to puck in HTML
*
* @class getRow
* @constructor
*/
PhasingListView.prototype.getRow = function(record){
    
    
    var html = "";
    dust.render("phasinglistview", record.data, function(err, out){
        html = out;
     }); 
    return html;
};

PhasingListView.prototype.analysizeStep = function(step){
        console.log(step);
        return {
            type : step.phasingStepType
            
        };
};


PhasingListView.prototype.parsePrepareNode = function(node){
    
    return  {
                    type : "PREPARE",
                    spaceGroupShortName : node.spaceGroupShortName,
                    spaceGroup          : node.spaceGroup,
                    status              : "Success" ,
                    phasingStepId       : node.phasingStepId
                     
                };
};

PhasingListView.prototype.parseSubstructureNode = function(node){
   if (node){
       if (node.children){
            var status = "Failure";
            if (node.children.length > 0){
                status = "Success";                
            }
            
             if (node.children.length == 0){
                status = "Not found";                
            }
            
            return  {
                    type : "SUBS. DETERMINATION",
                    spaceGroupShortName : node.spaceGroupShortName,
                    spaceGroup          : node.spaceGroup,  
                    runs                : node.children.length,
                    status              : status  
                };
       }
   }
};


PhasingListView.prototype.getSubstructureStep = function(node){
     if (node){
       if (node.children){
          return node.children;
       }
   }
   return [];
};

PhasingListView.prototype.getPhasingSteps = function(node){
    var phasing = [];
     if (node){
      var subtructures = this.getSubstructureStep(node);
     
      for(var i = 0; i < subtructures.length; i++){
         
          phasing = _.concat(phasing, subtructures[i].children);
      }
   }
   return phasing;
};

PhasingListView.prototype.getModelSteps = function(node){
    var models = [];
   var phasingSteps = this.getPhasingSteps(node); 
  
   for(var i = 0; i < phasingSteps.length; i++){
        if (phasingSteps[i].children){ 
            models = _.concat(models, phasingSteps[i].children);    
        }
   } 
   return models;
};

PhasingListView.prototype.decideGoodStatus = function(metrics, stats){
    var ccPartial = false;
    var pseudo = false;
         
    for(var i =0; i< metrics.length; i++){     
        if (metrics[i].indexOf("CC of partial") != -1){
            if (Number(stats[i]) > 24){
                ccPartial = true;                
            }
        }  
        
         if (metrics[i].indexOf("Pseudo_free_CC") != -1){
            if (Number(stats[i]) > 65){
                
                pseudo = true;
            }
        } 
        
    }
    
    if (pseudo && ccPartial){
            return 1;
    } 
        
    return 0;
};

PhasingListView.prototype.analizePhasingNodes = function(phasingNodes){
    var records = {
      withStatistics : 0,
      withoutStatistics : 0,
      successCondition : 0  
        
        
    };
    for(var i = 0; i < phasingNodes.length; i++){
     
        if (phasingNodes[i].statisticsValue != null){
            records.withStatistics = records.withStatistics + 1;
            /** Parsing status */
            try{
            
                var statistics = phasingNodes[i].statisticsValue.split(",");
                var metrics = phasingNodes[i].metric.split(",");
                
                records.successCondition = records.successCondition + this.decideGoodStatus(metrics, statistics);
             
            }
            catch(e){
                
                console.log(e);
            }
        }
        else{
             records.withoutStatistics = records.withoutStatistics + 1;
        }
       
        
    }
    return records;
};
PhasingListView.prototype.parsePhasingNode = function(node){
   if (node){
       if (node.children){
           
           var phasingSteps = this.getPhasingSteps(node); 
           
            var status = "Failure";
            if (phasingSteps.length > 0){
                status = "Success";                
            }
            
             if (phasingSteps.length == 0){
                status = "Not found";                
            }
                    
            return  {
                    type : "PHASING",
                    runs                : phasingSteps.length ,
                    status              : status,
                    stats              : this.analizePhasingNodes(phasingSteps)
                };
       }
   }
};

PhasingListView.prototype.parseModelNode = function(node){
    
    var models = this.getModelSteps(node);   
    
     var status = "Failure";
    if (models.length > 0){
        status = "Success";                
    }
    
        if (models.length == 0){
        status = "Not found";                
    }
                   
    return  {
            type : "MODEL BUILDING",
            //spaceGroupShortName : node.spaceGroupShortName,
            // spaceGroup          : node.spaceGroup,  
            runs                : models.length ,
             status              : status
        };
     
   
};


PhasingListView.prototype.formatData = function(data){
    
   
    var records = [];
    if (data){
        for(var i =0; i < data.length; i++){
            
            records.push({
                prepare        : this.parsePrepareNode(data[i]),
                substructure   : this.parseSubstructureNode(data[i]), 
                phasing        : this.parsePhasingNode(data[i]), 
                models         : this.parseModelNode(data[i]),   
            });
            
        }
    
    }
    return records;
};