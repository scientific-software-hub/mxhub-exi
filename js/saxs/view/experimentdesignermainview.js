function ExperimentDesignerMainView() {
	
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	this.queueGridList = [];

	MainView.call(this);

	this.templateGrid = new TemplateGrid({
		minHeight : 300,
		height : 440,
		gridType : 'Ext.grid.Panel',
		title : 'Experiments',
		grouping : false,
		tbar : true
	});
	
	
	this.onSelect = new Event(this);
	this.onDeselect = new Event(this);
}

ExperimentDesignerMainView.prototype.getPanel = MainView.prototype.getPanel;

ExperimentDesignerMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'hbox'
	    },
	    margin : 30,
		bodyStyle : {
			"background-color" : "#E6E6E6" 
		},
	    border: 1,
	    style: {borderColor:'#000000', borderStyle:'solid', borderWidth:'1px'},
	    defaults: {
	        labelWidth: 80,
	        xtype: 'datefield',
	        flex: 1,
	    },
	    items: [this.templateGrid.getPanel([])]
	});
};

ExperimentDesignerMainView.prototype.load = function() {
	var _this = this;
	this.panel.setLoading();
	var manager = new ProposalUpdater(); 
	this.templateGrid.grid.setLoading();
	manager.onSuccess.attach(function(sender, proposals){
		_this.panel.setLoading(false);
		var adapter = new DataAdapter();
		adapter.onSuccess.attach(function(sender, experiments){
			_this.templateGrid.store.loadData(experiments);
			_this.templateGrid.grid.setLoading(false);
		});
		
		adapter.getByExperimentByKey("experimentType", "TEMPLATE");
	});
	manager.get();
	
	this.panel.setTitle("Experiment Designer");
};
