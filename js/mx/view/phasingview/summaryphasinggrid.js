/**
* It shows a summary about the phasing steps. Basically, one line per space group 
*
* @class SummaryPhasingGrid
* @constructor
*/
function SummaryPhasingGrid(args) {
	
    this.pseudoFreeMin = 24;
    this.ccOfPartialModel = 60;    
    this.onSelect = new Event(this);
}

SummaryPhasingGrid.prototype.load = function(data) {
   
  /** Adding metrics as columns on the phasing Step */
   for (var i = 0; i < data.length; i++) {
       var element = data[i];
       if (element.metric){
           var metrics = element.metric.split(",");
           var statisticsValues = element.statisticsValue.split(",");
           if (metrics.length > 0){            
               for (var j = 0; j < metrics.length; j++) {                  
                   element[metrics[j]] = statisticsValues[j];
               }
               
           }
       }
   }
   this.data = data;
   this.store.loadData(data);
};


SummaryPhasingGrid.prototype.filter = function(data, metric, min, max) {        
    var filterFunction = function(b){             
        if (b){
            if(b[metric]){
                
                try{
                    if (Number(b[metric]) > min){
                        if (Number(b[metric]) < max){
                            return true;
                        }
                    }
                
                }   
                catch(e){
                    return false;
                }
            }
        }
        return false;
    };
    return _.filter(data, filterFunction);
};

SummaryPhasingGrid.prototype.getPanel = function() {
	var _this = this;
	this.store = Ext.create('Ext.data.Store', {
		fields : [  
                    'phasingStepId',
                    'previousPhasingStepId',
                    'processingPrograms',
                    'processingStatus',
                    'proposalId',
                    'sessionId',
                    'solventContent',
                    'spaceGroup',
                    'spaceGroupShortName',
                    'statisticsValue',
                    'phasingStepType',
                    'method',
                    'lowRes',
                    'highRes',
                    'phasingPrograms',
                    'enantiomorph',
                    'anomalous',
                    'Pseudo_free_CC',
                    'CC of partial model',
                    'anomalous',
                    'acronym',
                    'Average Fragment Length']
	});
    
    var selModel = Ext.create('Ext.selection.RowModel', {
		allowDeselect : true,
		//mode : 'multi',
		listeners : {
			select : function(sm, selection) {
               _this.onSelect.notify(selection.data);
						}

		} });
        
    this.pseudofreeCCSplitter =    Ext.create('Ext.slider.Multi', {
            width: 300,           
            hideLabel: false,
            fieldLabel : 'Pseudo Free CC',
            increment: 1,
            minValue: 0,
            maxValue: 120,
            values: [0, 100]
    });
    
    this.ccOfPartialModel =    Ext.create('Ext.slider.Multi', {
            width: 300,           
            hideLabel: false,
            fieldLabel : 'CC of Partial Model',
            increment: 1,
            minValue: 0,
            maxValue: 120,
            values: [0, 100]
    });
    
        
    this.tbar = Ext.create('Ext.toolbar.Toolbar', {
 
    width   : 500,
    items: [
       
         
         this.pseudofreeCCSplitter ,
         this.ccOfPartialModel,
     
        '-', // same as {xtype: 'tbseparator'} to create Ext.toolbar.Separator
        {
            // xtype: 'button', // default for Toolbars
            text: 'Apply filter',
            listeners : {
                click : function(){
                    var data = _this.filter(_this.data, 'Pseudo_free_CC',  _this.pseudofreeCCSplitter.getValues()[0],  _this.pseudofreeCCSplitter.getValues()[1]);
                    _this.store.loadData(_this.filter(data, 'CC of partial model',  _this.ccOfPartialModel.getValues()[0],  _this.ccOfPartialModel.getValues()[1]));
                }
                
            }
        },
          {
            // xtype: 'button', // default for Toolbars
            text: 'Clear filter',
            listeners : {
                click : function(){
                  
                    _this.store.loadData(_this.data);
                }
                
            }
        }
    ]
});

	this.panel = Ext.create('Ext.grid.Panel', {
		title : 'Phasing Steps',
		store : this.store,
        selModel : selModel,
        tbar :  this.tbar,
        height : 600,
        cls : 'border-grid',
		layout : 'fit',
        flex : 1,
         viewConfig : {
                    stripeRows : true,
                    getRowClass : function(record, rowIndex, rowParams, store){

                      /*  if (record.data.phasingStepType == "PREPARE"){
                            return "blue-grid-row";
                        }
                        if (record.data.phasingStepType == "SUBSTRUCTUREDETERMINATION"){
                            return "blue2-grid-row";
                        }
                        if (record.data.phasingStepType == "PHASING"){
                            return "blue3-grid-row";
                        }
                        if (record.data.phasingStepType == "MODELBUILDING"){
                            return "white-grid-row";
                        }
                        return "warning-grid-row";*/
                    }
                },
		columns : [ 
                         {
                            text : 'Space Group',
                            flex : 1,
                            dataIndex : 'spaceGroupShortName'
                        },
                        {
                            text : 'Steps',
                            columns : [     {
                                                text : 'Prepare',
                                                flex : 1,
                                                dataIndex : 'previousPhasingStepId',
                                                renderer : function(grid, e, record){
                                                    
                                                    if (record.data.phasingStepType == "PREPARE"){
                                                        return record.data.phasingPrograms.toUpperCase();
                                                    }
                                                }
                                            },
                                             {
                                                text : 'Subs. Deter.',
                                                flex : 1,
                                                dataIndex : 'previousPhasingStepId',
                                                renderer : function(grid, e, record){
                                                   
                                                    if (record.data.phasingStepType == "SUBSTRUCTUREDETERMINATION"){
                                                        return record.data.phasingPrograms.toUpperCase();
                                                    }
                                                }
                                            },
                                             {
                                                text : 'Phasing',
                                                flex : 1,
                                                dataIndex : 'previousPhasingStepId',
                                                renderer : function(grid, e, record){
                                                   
                                                    if (record.data.phasingStepType == "PHASING"){
                                                         return record.data.phasingPrograms.toUpperCase();
                                                    }
                                                }
                                            },
                                             {
                                                text : 'Model',
                                                flex : 1,
                                                dataIndex : 'previousPhasingStepId',
                                                renderer : function(grid, e, record){
                                                    if (record.data.phasingStepType == "MODELBUILDING"){
                                                         return record.data.phasingPrograms.toUpperCase();
                                                    }
                                                }
                                            },
                            ]
                        },
                         {
                            text : 'phasingStepId',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'phasingStepId'
                      
                        },
                         {
                            text : 'previousPhasingStepId',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'previousPhasingStepId'
                        },
                         {
                            text : 'phasingStepId',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'phasingStepId'
                        },
                        
                          {
                            text : 'Protein',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'acronym'
                        },
                         {
                            text : 'Method',
                            flex : 1,
                            dataIndex : 'method'
                        },
                         {
                            text : 'Low Resolution',
                            flex : 1,
                            dataIndex : 'lowRes',
                            renderer : function(grid, e, record){
                                                    if (record.data.phasingStepType == "MODELBUILDING"){
                                                         return record.data.lowRes + " - " + record.data.highRes ;
                                                    }
                                                }
                        },
                         {
                            text : 'High Resolution',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'highRes'
                        },
                         {
                            text : 'Enantiomorph',
                            flex : 1,
                            dataIndex : 'enantiomorph'
                        },
                         {
                            text : 'Anomalous',
                            flex : 1,
                            dataIndex : 'anomalous'
                        },
                         {
                            text : 'Solvent',
                            flex : 1,
                            dataIndex : 'solventContent'
                        },
                         {
                            text : ' Program',
                            flex : 1,
                            hidden : true,
                            dataIndex : 'phasingPrograms'
                        },
                         {
                            text : 'Pseudo Free <br />(CC)',
                            flex : 1,
                            dataIndex : 'Pseudo_free_CC'
                        },
                         {
                            text : 'Partial Model <br />(CC)',
                            flex : 1,
                            dataIndex : 'CC of partial model'
                        },
                          {
                            text : 'Avg. Fragment <br />Length',
                            flex : 1,
                            dataIndex : 'Average Fragment Length'
                        }
                        
                       
                        
                ]
	});
	return this.panel;
};


