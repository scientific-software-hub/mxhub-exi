

function PhasingViewerMainView() {
	MainView.call(this);	
	var _this = this;
	this.phasingNetworkWidget = new PhasingNetworkWidget({tbar : "MENU"});
    
   // this.phasingGrid = new PhasingGrid();
    this.summaryPhasingGrid = new SummaryPhasingGrid();
    this.fileManagerPhasingGrid = new FileManagerPhasingGrid();
    
    
    this.summaryPhasingGrid.onSelect.attach(function(sender, phasingStep){
       var onSuccess = function(sender, data){           
           if (data){
                data = _.flatten(data);
                var files = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].fileName != null){
                        files.push(data[i]);
                    }
                    
                }           
                _this.fileManagerPhasingGrid.load(files);
                _this.fileManagerPhasingGrid.panel.setLoading(false);
           }
       };
       
       var onError = function(sender,error){
           alert(error);
           _this.fileManagerPhasingGrid.panel.setLoading(false);
       };
       _this.fileManagerPhasingGrid.panel.setLoading();    
       EXI.getDataAdapter({onSuccess : onSuccess,onError: onError }).mx.phasing.getPhasingFilesByPhasingStepId(phasingStep.phasingStepId);
	
    });
}

PhasingViewerMainView.prototype.getPanel = MainView.prototype.getPanel;


PhasingViewerMainView.prototype.getContainer = function() {
	this.tabPanel = Ext.create('Ext.tab.Panel', {
				margin : 10,
				cls : 'border-grid',
				defaults : {
						anchor : '100%'
				},
				items : [
                            
                            {
                                title: 'Summary',
                                bodyPadding: 10,
                                items : [{
                                    xtype: 'container',
                                    layout : 'hbox',
                                    items : [
                                                this.summaryPhasingGrid.getPanel(),
                                                this.fileManagerPhasingGrid.getPanel()
                                                                                    
                                    ]
                                
                                }]
                            },
                           /* {
                                title: 'Phasing Dataset',
                                bodyPadding: 10,
                                items : this.phasingGrid.getPanel()
                            },*/
                             {
                                title: 'Network',
                                bodyPadding: 10,
                                items : this.phasingNetworkWidget.getPanel()
                            }
                           
				         	
					]
			});

	return this.tabPanel;

};


PhasingViewerMainView.prototype.load = function(data, phasingStepId) {
	var _this = this;
	this.panel.setTitle("Phasing Viewer");
    
    /** filtering data */
    var phasingStepIdParantes = [];
    var aux = [];
    if (phasingStepId){
           var parent = _.find(data, function(b){return  b.phasingStepId == phasingStepId;});
          if (parent != null){ 
                aux.push(parent);
                phasingStepIdParantes.push(parent.phasingStepId);
            }
            
        var sortByPhasingId = function(b){return  b == data[i].previousPhasingStepId;};     
        for(var i =0; i< data.length; i++){            
            if (_.find(phasingStepIdParantes, sortByPhasingId(b)) != null){ 
                aux.push(data[i]);
                phasingStepIdParantes.push(data[i].phasingStepId);
            }
            
        }
        data =aux;
        
    }
    
    
    this.summaryPhasingGrid.load(data);
    _this.phasingNetworkWidget.load(data);
   
};
