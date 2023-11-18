function WorkSpaceListView(){
	this.width = 250;
	this.height = 800;

	this.selectionMenu = new SelectionMenu();
	this.onSelect = new Event();
	
	this.projectId = null;
}


WorkSpaceListView.prototype.loadProjects = function(projects){
		if (projects != null){
			this.projectStore.loadData(projects);
		}
		this.loadRuns();
};

WorkSpaceListView.prototype.loadRuns = function(){
	var _this = this;
	var exidataAdapter = new ExiDataAdapter();
	exidataAdapter.onSuccess.attach(function(sender, runs){
		_this.runStore.loadData(runs.reverse());
		_this.runGrid.setLoading(false);
	});
	this.runGrid.setLoading();
	
	this.projectId = exiSAXS.localExtorage.userManager.getActiveProject().internalId;
	exidataAdapter.getRuns(exiSAXS.localExtorage.userManager.getActiveProject().internalId);
};



WorkSpaceListView.prototype.setSelectedItems = function(items){
	/** remove id **/
	for (var i = 0; i < items.length; i++) {
		delete items[i].id;
	}
	this.selection.loadData(items);
	this.projectGrid.collapse();
};




WorkSpaceListView.prototype.getSelectionPanel = function(){
	this.selection = Ext.create('Ext.data.Store', {
	    fields:['subtractionId', 'scattering', 'macromoleculeAcronym', 'concentration', 'framesMerge', 'framesCount', 'exposureTemperature']
	});
	function formatFrames(averaged, count){
		if ((averaged != null) && (count != null)){
			if (averaged / count < 0.3){
				return "<span style='color:red;'>" + averaged + "/" + count + "</span>";
			}
			if (averaged / count < 0.7){
				return "<span style='color:orange;'>" + averaged + "/" + count + "</span>";
			}
		}
		return averaged + "/" + count;
	}
	
	function processResult(answer){
							if (answer == "yes"){
								exiSAXS.localExtorage.selectedSubtractionsManager.remove(record.data);
							}
	}
	
	this.selectionGrid = Ext.create('Ext.grid.Panel', {
	    store: this.selection ,
	    title : "Selection",
	    emptyText : "No selection",
	    tbar : this.selectionMenu.getPanel(),
	    columns: [
	        { 	
	        	text: '',  
	        	dataIndex: 'scattering', 
	        	renderer : function(grid, data, record){
	    			return '<img src=' + new DataAdapter().getImage(record.data.subtractionId, "scattering") + '   height="70" width="70" >';
	        	} 
	        },
	        { 	text: '', 
	        	dataIndex: 'macromoleculeAcronym', 
	        	flex: 0.8, 
	        	renderer : function(grid, data, record){
	    			return record.data.macromoleculeAcronym + 
	    					"<br />" +
	    					 BUI.formatValuesUnits(record.data.concentration, "mg/ml", 7, 2) +
	    					"<br />" +
	    					record.data.exposureTemperature + "<span class='key_subgrid'> C</span>" +
	    					"<br />" +
	    					formatFrames(record.data.framesMerge, record.data.framesCount);
	        	} 	
	        },
	        { 
	        	text: '', 
	        	id : 'remove',
	        	dataIndex: 'scattering', 
	        	width : 50,
	        	renderer: function(value){
	                return "<br />" + '<img style="cursor: pointer; height:30px;width:30px;" src="images/icon/ic_highlight_remove_black_24dp.png" />';
	            }
	        },
	    ],
	    width: 200,
	    listeners: {
	    	cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					if (cellIndex == 2) {
				
						Ext.Msg.show({
						   title:'Discard subtraction?',
						   msg: 'Your are discarding a selected subtraction. You may re-add it afterwards. Would you like to discard it?',
						   buttons: Ext.Msg.YESNO,
						   icon: Ext.Msg.QUESTION,
						   fn: processResult,
						   height : 150
						});
					}
	    	}
	    }
	});
	return this.selectionGrid;
};

WorkSpaceListView.prototype.getProjectPanel = function(){
	this.projectStore= Ext.create('Ext.data.Store', {
	    fields:['name']
	});

	this.projectGrid = Ext.create('Ext.grid.Panel', {
	    store: this.projectStore,
	    title : "Projects",
	    emptyText : "No projects", 
	    columns: [
	        { text: 'Name',  dataIndex: 'name', flex: 1, 
	        	
	        	renderer : function(grid, opts, record){
	        		var html =  "<span class='projectName'>" + record.data.name + "</span><br/>" +
	        			    "<span class='projectDescription'>"  + record.data.description + "</span>";
	        		
	        		if (record.data.subtractions != null){
	        			html = html + "<br />" + record.data.subtractions.length + " datasets selected";
	        		}
	        		
	        		return html;
	        				
	        	} 
	        }
	    ],
	    height: 200
	});
	return this.projectGrid;
};

WorkSpaceListView.prototype.getRunPanel = function(){
	var _this = this;
	this.runStore= Ext.create('Ext.data.Store', {
	    fields:['name']
	});

	this.runGrid = Ext.create('Ext.grid.Panel', {
	    store: this.runStore,
	    title : "Run",
	    emptyText : "No Runs",
	    minHeight : 600,
	    dockedItems: [{
	        xtype: 'toolbar',
	        dock: 'bottom',
	        ui: 'footer',
	        items: [
	            { xtype: 'component', flex: 1 },
	            { 
	            	xtype: 'button', 
	            	text: 'Refresh', 
	            	handler : function(sender, a, b){
	            		_this.loadRuns();
	            	
	            	} 
	            }
	        ]
	    }],
	    columns: [
	        {
	        	text: 'Name',  
	        	dataIndex: 'name', 
	        	flex: 1, 
	        	renderer : function(grid, opts, record){
	        		var jobs = record.data.jobs;
	        		var html = '<table>';
	        		html = html + "<tr ><td  class='nameRun'>" + record.data.name + "</td></tr>";
	        		html = html + "<tr ><td  class='statusRun'>" + record.data.status + "</td></tr>";
	        		html = html + "<tr ><td  class='dateRun'>" + record.data.creationDate + "</td></tr>";
	        		if (jobs != null){
	        			for (var i = 0; i < jobs.length; i++) {
							html = html + "<tr ><td class='jobRow'>" + jobs[i].name +"</td><td>" + jobs[i].status + "</td></tr>";
						}
	        		}
	        		return html + "</table>";
	        				
	        	} 
	        }
	    ],
	    height: 200
	});
	
	  this.runGrid.on('select', function( grid, record, index, eOpts ){
		  	location.hash = "/project/" + _this.projectId + "/run/" +record.data.internalId + "/main";
	    });
	  
	return this.runGrid;
};


WorkSpaceListView.prototype.getPanel = function(){
	var _this =this;
	this.panel =  Ext.create('Ext.panel.Panel', {
	    layout : 'fit',
	    autoScroll : true,
	    defaults: {
	        bodyStyle: 'padding:15px'
	    },
	    /*layout: {
	        type: 'accordion',
	        titleCollapse: false,
	        animate: true,
	        activeOnTop: true
	    },*/
	    items: [
	            _this.getSelectionPanel(),
	            _this.getProjectPanel(),
	            _this.getRunPanel()
        ]
	});
	return this.panel; 
};