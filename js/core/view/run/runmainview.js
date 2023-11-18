function RunMainView() {
	this.id = BUI.id();
	MainView.call(this);
}

RunMainView.prototype.getPanel = MainView.prototype.getPanel;

RunMainView.prototype.getOutputPanel = function() {
	this.outputStore = Ext.create('Ext.data.Store', {
	    fields:['name', 'value', 'type', 'targetId', 'tool', 'i' ],
	    groupField: 'tool',
	    sorters : [{property: 'i', direction : 'DESC'}]
	});

	return Ext.create('Ext.grid.Panel', {
	    store: this.outputStore,
	    cls : 'border-grid',
	    features: [{ftype:'grouping'}],
	    columns: [
	        { text: 'Tool',  dataIndex: 'tool', flex : 1, hidden:true },
	        { text: 'id',  dataIndex: 'i', flex : 1, hidden:true },
	        { text: 'Name',  dataIndex: 'name', flex : 1 },
	        { text: 'value', dataIndex: 'value', flex : 1 },
	        { text: 'type', dataIndex: 'type', flex : 1 },
	        { text: 'target', dataIndex: 'targetId', flex : 1, hidden:true },
	        { text: '', dataIndex: 'targetId', flex : 1, renderer : function(grid, opt, record){
        		var url =EXI.credentialManager.getConnections()[0].exiUrl + "/file/" + record.data.targetId + "/download";
        		return "<div><a style='color:blue;' href='"+ url +"'>Download</a></div>";
	        } 
        }
	    ]
	});
};


RunMainView.prototype.getGeneralContainerList = function(run) {
	var li = "<ul class='generalContainerRunList'>";
	li = li + "<li>Name: " + run.name + "</li>";
	li = li + "<li>Status: " + run.status + "</li>";
	li = li + "<li>" + run.creationDate + "</li>";
	return li;
};

RunMainView.prototype.getGeneralContainer = function(run) {
	return {
		xtype : 'panel',
		title : "General",
		margin : 10,
		border : 1,
		style: {borderColor:'gray', borderStyle:'solid', borderWidth:'1px'},
		items : [
		         {
		        	 html 		: this.getGeneralContainerList(run),
		        	 margin 	: '10 0 0 50'
		         }
		]
	};
};

RunMainView.prototype.getMainPanel = function() {
	
};

RunMainView.prototype.getTabs = function() {
	return  Ext.createWidget('tabpanel',
			{
				plain : true,
				margin : '20 0 0 0',
				items : [
				     	this.getMainPanel(),
					{
						tabConfig : {
							title : 'Output Files'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							height : 700,
							padding : 20,
							cls : 'border-grid',
							items : [ 
							         this.getOutputPanel()
							]
						}

						]
					}
//				     	,
//					{
//						tabConfig : {
//							title : "Input",
//						},
//						items : [  
//									{
//										xtype : 'container',
//										layout : 'vbox',
//										height : 700,
//										padding : 20,
//										cls : 'border-grid',
//										items : [ 
//										     	]
//									}
//					]
//			}
			]});
};

RunMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'anchor'
	    },
	    defaults : {
			anchor : '100%',
			hideEmptyLabel : false },
	    margin : 5,
		bodyStyle : {
			"background-color" : "#E6E6E6" 
		},
	    items: [
	            
	            	this.getTabs()
	            ]
	});
};

RunMainView.prototype.loadMain = function(run) {
	
};

RunMainView.prototype.load = function(run) {
	if (run != null) {
		this.panel.setTitle(run.name);
		var parsed = [];
		for (var i = 0; i < run.jobs.length; i++) {
			for (var j = 0; j < run.jobs[i].output.length; j++) {
				run.jobs[i].output[j]["tool"] = run.jobs[i].name + " " + run.jobs[i].version;
				run.jobs[i].output[j]["i"] = i;
				parsed.push(run.jobs[i].output[j]);
			}
		}
		this.outputStore.loadData(parsed);
	}
	this.loadMain(run);
};
