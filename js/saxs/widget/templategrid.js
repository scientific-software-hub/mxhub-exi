function TemplateGrid(args) {
	this.height = 500;
}




TemplateGrid.prototype.getTbar = function() {
	var _this = this;
	var actions = [];

	actions.push(Ext.create('Ext.Action', {
		icon: 'images/icon/add.png',
		text : 'Add',
		disabled : false,
		handler : function(widget, event) {
			var wizardWidget = new WizardWidget({
				windowMode : true,
				width : 1200
			});

			wizardWidget.onFinished.attach(function(sender, result) {
				var adapter = new DataAdapter();
				adapter.onSuccess.attach(function(sender, experiment) {
					wizardWidget.window.close();
					location.hash = "/experiment/experimentId/" + experiment.experimentId + "/main";
				});
				wizardWidget.current.setLoading();
				adapter.saveTemplate(result.name, "comments", result.data);
			});

			var manager = new ProposalUpdater(); 
			manager.onSuccess.attach(function(sender, proposals){
				wizardWidget.draw(this.targetId, new MeasurementCreatorStepWizardForm(ProposalManager.getMacromolecules(), ProposalManager.getBuffers()));
			});
			manager.get();
			
		}
	}));
	return actions;
};

TemplateGrid.prototype.deselectAll = function() {
	this.grid.getSelectionModel().deselectAll();
};

TemplateGrid.prototype.selectById = function(macromoleculeId) {
	this.grid.getSelectionModel().deselectAll();
	for ( var i = 0; i < this.grid.getStore().data.items.length; i++) {
		var item = this.grid.getStore().data.items[i].raw;
		if (item.macromoleculeId == macromoleculeId) {
			this.grid.getSelectionModel().select(i);
		}
	}
};

TemplateGrid.prototype.load = function(macromolecules) {
	this.store.loadData(macromolecules, false);
};

TemplateGrid.prototype.getColumns = function() {
	var _this = this;
	var columns = [
	{
		text : 'Name',
		dataIndex : 'name',
		id : this.id + "name",
		flex : 1,
		hidden : false
	},{
        xtype:'actioncolumn',
        width:40,
        text : 'Edit',
        items: [{
            icon: 'images/icon/edit.png',  // Use a URL in the icon config
            tooltip: 'Edit',
            handler: function(grid, rowIndex, colIndex) {
            	location.hash = "/experiment/experimentId/" + grid.getStore().getAt(rowIndex).get("experimentId") + "/main";
            }
        }]
    }, {
		id : _this.id + 'REMOVE',
		width : 100,
		sortable : false,
		renderer : function(value, metaData, record, rowIndex, colIndex, store) {
			return BUI.getRedButton('REMOVE');
		}
	}  ];

	if (this.btnRemoveVisible) {
		columns.push({
			id : _this.id + 'buttonRemoveMacromolecule',
			width : 85,
			sortable : false,
			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
				if (_this.btnRemoveVisible) {
					return BUI.getRedButton('REMOVE');
				}
				return null;
			}
		});
	}

	return columns;
};

TemplateGrid.prototype._prepareData = function(macromolecules) {
	return macromolecules;
};

/** Returns the grid **/
TemplateGrid.prototype.getPanel = function() {
	var _this = this;

	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'name',  'comments' ],
		data : [],
		sorters : [{property : 'experimentId', direction: 'desc'}]
	});


	this.grid = Ext.create('Ext.grid.Panel', {
		id : this.id,
		title : 'My Experiments',
		store : this.store,
		height : this.height,
		maxHeight : this.maxHeight,
		columns : this.getColumns(),
		width : this.width,
		viewConfig : {
			stripeRows : true,
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
//					_this.edit(ProposalManager.getMacromoleculeById(record.data.macromoleculeId));
					location.hash = "/experiment/experimentId/" + record.data.experimentId + "/main";
				},
				'cellclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
//					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonEditMacromolecule') {
//						_this.edit(ProposalManager.getMacromoleculeById(record.data.macromoleculeId));
//					}
//					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonRemoveMacromolecule') {
//						BUI.showBetaWarning();
//					}
				}

			}
		}
	});

	/** Adding the tbar **/
	this.grid.addDocked({
		xtype : 'toolbar',
		height : 50,
		items : this.getTbar()
	});
	return this.grid;
};

TemplateGrid.prototype.input = function() {
	return {
		proposal : DATADOC.getProposal_10()
	};
};

TemplateGrid.prototype.test = function(targetId) {
	var TemplateGrid = new TemplateGrid({
		width : 800,
		height : 350,
		collapsed : false,
		tbar : true
	});

	BIOSAXS.proposal = new Proposal(TemplateGrid.input().proposal);
	var panel = TemplateGrid.getPanel(BIOSAXS.proposal.macromolecules);
	panel.render(targetId);
};
