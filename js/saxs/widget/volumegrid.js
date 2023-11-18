function VolumeGrid() {
	this.id = BUI.id();
}

VolumeGrid.prototype.load= function(experiment) {
	this.experiment = experiment;
	this.store.loadData(this._prepareData(experiment));
};

VolumeGrid.prototype.getPanel = function(data, title) {
	var _this = this;
	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'name', 'volume', 'macromoleculeId', 'bufferId' ]
//		data : data
	});
	this.store.sort([ {
		property : 'name',
		direction : 'ASC'
	} ]);

	var grid = Ext.create('Ext.grid.Panel', {
		title : "Sample Requirements and existing stock solutions",
		cls : 'border-grid',
		height : 400,
		maxHeight : 400,
		width : 900,
		store : this.store,
		margin : '10 0 50 10',
//		tbar : [ 
//         {
//			text : 'Go to Shipment',
//			icon : '../images/plane-small.gif',
//			handler : function() {
//				window.location = BUI.getCreateShipmentList();
//			}
//		} ],
		viewConfig : {
			stripeRows : true,
			listeners : {
				cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonCreate') {
						var stockSolutionWindow = new StockSolutionWindow();
						/** On stock solution SAVED **/
						stockSolutionWindow.onSaved.attach(function(sender) {
							/** Proposal should be refreshed **/
							
						});
						var acronym = "ST";
						if (record.data.macromoleculeId != null) {
							acronym = acronym + "_" + EXI.proposalManager.getMacromoleculeById(record.data.macromoleculeId).acronym;
						}
						if (record.data.bufferId != null) {
							acronym = acronym + "_" + EXI.proposalManager.getBufferById(record.data.bufferId).acronym;
						}
						stockSolutionWindow.draw({
							concentration : record.data.concentration,
							macromoleculeId : record.data.macromoleculeId,
							bufferId : record.data.bufferId,
							name : acronym,
							volume : record.data.volume
						});
					}

					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonStockSolutions') {
						var stockSolutionGrid = new StockSolutionGrid({
							btnAddVisible : false,
							btnEditVisible : false,
							btnRemoveVisible : false,
							btnAddExisting : false,
							isPackedVisible : true,
							multiselect : false
						});

						var window = Ext.create('Ext.window.Window', {
							title : 'Stock solutions by specimen',
							height : 400,
							width : 800,
							layout : 'fit',
							items : [ stockSolutionGrid.getPanel() ],
							buttons : [ {
								text : 'Close',
								handler : function() {
									window.close();
								}
							} ]

						}).show();
						stockSolutionGrid.refresh(EXI.proposalManager.getStockSolutionsBySpecimen(record.data.macromoleculeId, record.data.bufferId));
					}
				}
			}
		},
		columns : [
//			{
//				text : '',
//				dataIndex : 'macromoleculeId',
//				width : 20,
//				renderer : function(val, y, sample) {
//					if (val != null) {
////						return BUI.getRectangleColorDIV(BIOSAXS.proposal.macromoleculeColors[val], 10, 10);
//						return BUI.getRectangleColorDIV(_this.experiment.macromoleculeColors[val], 10, 10);
//					}
//				}
//			},
//			{
//				text : '',
//				dataIndex : 'bufferId',
//				width : 20,
//				renderer : function(val, y, sample) {
//					if (val != null) {
//						return BUI.getRectangleColorDIV(_this.experiment.getSpecimenColorByBufferId(val), 10, 10);
//					}
//				}
//			},
			{
				text : 'Specimen',
				dataIndex : 'name',
				flex : 0.5
			},
			{
				text : 'Estimated Volume',
				dataIndex : 'volume',
				tooltip : 'Estimation of the maximum volume needed for making this experiment',
				flex : 0.5,
				editor : {
					allowBlank : true
				},
				renderer : function(val, y, sample) {
					return BUI.formatValuesUnits(sample.data.volume, '&#181l', {
						fontSize : 16,
						decimals : 2,
						unitsFontSize : this.unitsFontSize
					});
				}
			},
			{
				text : 'Stock Solution',
//				id : _this.id + 'buttonStockSolutions',
//				dataIndex : 'name',
				flex : 0.5,
				tooltip : 'Stock Solutions containing this specimen in this proposal',
				renderer : function(value, metaData, record, rowIndex, colIndex, store) {
					var macromoleculeId = record.data.macromoleculeId;
					var bufferId = record.data.bufferId;
					var stockSolutions = EXI.proposalManager.getStockSolutionsBySpecimen(macromoleculeId, bufferId);
					if (stockSolutions.length > 0) {
//						icon : 'images/icon/testtube.png',
						return "<div><span style='font-size:18px'>" + stockSolutions.length + "</span> x<img height='15px' src='images/icon/testtube.png'></div>";
					}

				}
			}, {
				id : _this.id + 'buttonCreate',
				text : '',
				hidden : true,
				tooltip : 'Create a new stock solution for shipping',
				width : 170,
				sortable : false,
				renderer : function(value, metaData, record, rowIndex, colIndex, store) {
					return BUI.getGreenButton('CREATE STOCK SOLUTION', {
						width : 160
					});
				}
			} ]
	});
	return grid;

};

VolumeGrid.prototype._prepareData = function(experiment) {
	var keys = {};
	for ( var i = 0; i < experiment.getSamples().length; i++) {
		var sample = experiment.getSamples()[i];
		var key = "";
		if (sample.macromoleculeId == null) {
			key = experiment.getBufferById(sample.bufferId).acronym;
			if (keys[key] == null) {
				keys[key] = {
					macromoleculeId : sample.macromoleculeId,
					name : key,
					bufferId : sample.bufferId,
					volume : 0
				};
			}
			keys[key].volume = Number(sample.volume) + Number(keys[key].volume);
		}

		if ((sample.macromolecule3VO != null) || (sample.macromoleculeId != null)) {
			macromoleculeId = sample.macromoleculeId;
			if (sample.macromoleculeId == null) {
				sample.macromoleculeId = sample.macromolecule3VO.macromoleculeId;
			}
			key = EXI.proposalManager.getMacromoleculeById(sample.macromoleculeId).acronym + " + " + experiment.getBufferById(sample.bufferId).acronym;
			if (keys[key] == null) {
				keys[key] = {
					macromoleculeId : sample.macromoleculeId,
					name : key,
					bufferId : sample.bufferId,
					volume : 0
				};
			}
			keys[key].volume = Number(sample.volume) + Number(keys[key].volume);
		}
	}
	var data = [];
	for (var keyId in keys) {
		data.push(keys[keyId]);
	}

	return data;
};

VolumeGrid.prototype.refresh = function(experiment) {
	this.experiment = experiment;
	this.macromoleculeGrid.getStore().loadData(this._prepareData(this.experiment), false);
};

VolumeGrid.prototype.render = function() {
	this.macromoleculeGrid = this.getPanel([], "Estimation of required Volume");

	return {
		xtype : 'container',
		layout : 'vbox',
		margin : "0, 0, 0, 5",
		items : [ {
			xtype : 'container',
			layout : 'hbox',
			margin : "0, 0, 0, 0",
			items : [ this.macromoleculeGrid ]
		} ]
	};
};

VolumeGrid.prototype.input = function(experiment) {
	return {
		experiment : DATADOC.getExperiment_10()
	};
};

VolumeGrid.prototype.test = function(targetId) {
	var volumeGrid = new VolumeGrid();
	BIOSAXS.proposal = new Proposal(new MeasurementGrid().input().proposal);
	var panel = volumeGrid.getPanel(new Experiment(new VolumeGrid().input().experiment));
	Ext.create('Ext.panel.Panel', {
		height : 500,
		width : 1000,
		renderTo : targetId,
		items : [ panel ]
	});
};
