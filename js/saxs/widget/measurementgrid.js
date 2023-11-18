/**
 * Macromolecule Grid showing macromolecules and adding anb updating buttons
 * 
 * @height
 * @maxHeight
 * @width
 * @cssFontStyle
 * @searchBar makes this grid as Ext.ux.LiveSearchGridPanel
 * @tbar top bar containing "Add" and "Update From SMIS" button 
 * @collapsed
 * @collapsible
 * @btnEditVisible
 * @btnRemoveVisible
 * @multiselect makes it multiselect using Ext.selection.CheckboxModel
 * 
 * #onSelected
 * #onMacromoleculesChanged
 */
function MeasurementGrid(args) {
	
	this.id = BUI.id();

	this.height = 500;
	this.width = 900;

	this.maxWidth = 1200;
	this.minHeight = 500;

	this.unitsFontSize = 9;
	this.title = "Measurements";
	this.estimateTime = false;
	this.collapsed = true;
	this.tbar = true;

	this.showTitle = true;
	this.resizable = true;
	this.updateRowEnabled = true;
	
	this.isStatusColumnHidden = true;
	this.isTimeColumnHidden = true;
	this.removeBtnEnabled = true;
	this.margin = "10 10 0 10";
	
	this.height = 250;
	this.maxHeight = 250;
	
	this.collapsible = false;
	
	this.addBtnEnable = false;
	/**
	 * Hash map containing the keys of the editable columns. Ex:
	 * 'exposureTemperature' *
	 */
	this.editor = {
		comments : {
			xtype : 'textfield',
			allowBlank : true
		}
	};
	
	this.sorter = [ {
		property : 'priority',
		direction : 'ASC'
	} ];
	
//	this.selModel = Ext.create('Ext.selection.RowModel', {
//		allowDeselect : true,
//		mode : 'MULTI',
//		listeners : {
//			selectionchange : function(sm, selections) {
//				var selected = [];
//				for (var i = 0; i < selections.length; i++) {
//					selected.push(selections[i].raw);
//				}
//				_this.onSelected.notify(selected);
//			}
//		}
//	});
	
	
	if (args != null) {
		if (args.selModel != null) {
			this.selModel = args.selModel;
		}
		if (args.removeBtnEnabled != null) {
			this.removeBtnEnabled = args.removeBtnEnabled;
		}

		if (args.addBtnMultipleEdit != null) {
			this.addBtnMultipleEdit = args.addBtnMultipleEdit;
		}
		if (args.collapsed != null) {
			this.collapsed = args.collapsed;
		}
		if (args.resizable != null) {
			this.resizable = args.resizable;
		}

		if (args.editor != null) {
			this.editor = args.editor;
		}

		if (args.collapseBtnEnable != null) {
			this.collapseBtnEnable = args.collapseBtnEnable;
		}

		if (args.addBtnEnable != null) {
			this.addBtnEnable = args.addBtnEnable;
		}
		if (args.sortingBtnEnable != null) {
			this.sortingBtnEnable = args.sortingBtnEnable;
		}

		if (args.isPriorityColumnHidden != null) {
			this.isPriorityColumnHidden = args.isPriorityColumnHidden;
		}

		if (args.width != null) {
			this.width = args.width;
		}
		if (args.updateRowEnabled != null) {
			this.updateRowEnabled = args.updateRowEnabled;
		}

		if (args.showTitle != null) {
			this.showTitle = args.showTitle;
			if (this.showTitle == false) {
				this.title = null;
			}
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.maxHeight != null) {
			this.maxHeight = args.maxHeight;
		}
		if (args.minHeight != null) {
			this.minHeight = args.minHeight;
		}
		if (args.maxWidth != null) {
			this.maxWidth = args.maxWidth;
		}
		if (args.isStatusColumnHidden != null) {
			this.isStatusColumnHidden = args.isStatusColumnHidden;
		}
		if (args.isTimeColumnHidden != null) {
			this.isTimeColumnHidden = args.isTimeColumnHidden;
		}
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.estimateTime != null) {
			this.estimateTime = args.estimateTime;
		}
		if (args.margin != null) {
			this.margin = args.margin;
		}
		if (args.tbar != null) {
			this.tbar = args.tbar;
		}
		if (args.sorter != null) {
			this.sorter = args.sorter;
		}
	}
	
	this.onRemoved = new Event(this);
	this.onMeasurementChanged = new Event(this);
	this.onExperimentChanged = new Event(this);
}





MeasurementGrid.prototype.edit = function(macromolecule) {
	var _this = this;
	var window = new MacromoleculeWindow();
	window.onSave.attach(function(sender) {
//		_this.store.loadData(BIOSAXS.proposal.getMacromolecules());
//		_this.onMacromoleculesChanged.notify();
	});
	window.draw(macromolecule);
};

//MeasurementGrid.prototype.getTbar = function() {
//	var _this = this;
//	var actions = [];
//
//	actions.push(Ext.create('Ext.Action', {
//		icon: '../images/icon/add.png',
//		text : 'Add',
//		disabled : false,
//		handler : function(widget, event) {
//			_this.edit();
//		}
//	}));
//	actions.push("->");
//	actions.push(Ext.create('Ext.Action', {
//		icon : '../images/icon/refresh.png',
//		text : 'Update From SMIS',
//		tooltip : "Retrieve all the macromolecules of your proposal from SMIS database",
//		disabled : false,
//		handler : function(widget, event) {
//			_this.grid.setLoading("Connecting to SMIS");
//			var adapter = new BiosaxsDataAdapter();
//			adapter.onSuccess.attach(function(sender, data) {
//				BIOSAXS.proposal.setMacromolecules(data.macromolecules);
//				_this.refresh(BIOSAXS.proposal.macromolecules);
//				_this.grid.setLoading(false);
//			});
//			adapter.onError.attach(function(sender, data) {
//				_this.grid.setLoading(false);
//			});
//			adapter.updateDataBaseFromSMIS();
//		}
//	}));
//	return actions;
//};

MeasurementGrid.prototype.deselectAll = function() {
	this.grid.getSelectionModel().deselectAll();
};

MeasurementGrid.prototype.selectById = function(macromoleculeId) {
	this.grid.getSelectionModel().deselectAll();
	for ( var i = 0; i < this.grid.getStore().data.items.length; i++) {
		var item = this.grid.getStore().data.items[i].raw;
		if (item.macromoleculeId == macromoleculeId) {
			this.grid.getSelectionModel().select(i);
		}
	}
};

MeasurementGrid.prototype.load = function(data) {
	this.store.loadData(data, false);
};

MeasurementGrid.prototype.loadExperiment = function(experiment) {
	this.experimentList = new ExperimentList([ experiment ]);
	var data = this._prepareData(this.experimentList.getMeasurements(), this.experimentList);
	this.load(data);
};

MeasurementGrid.prototype._prepareData = function(measurements, experiments) {
	var data = [];	
	for (var i = 0; i < measurements.length; i++) {
		var measurement = measurements[i];
		var specimen = experiments.getSampleById(measurement.specimenId);
		var buffer = EXI.proposalManager.getBufferById(specimen.bufferId);
		measurement.buffer_acronym = buffer.acronym;
		measurement.bufferId = buffer.bufferId;
		measurement.volume = specimen.volume;
		if (specimen.macromolecule3VO != null) {
			measurement.acronym = specimen.macromolecule3VO.acronym;
			measurement.macromoleculeId = specimen.macromolecule3VO.macromoleculeId;
		}
		measurement.concentration = specimen.concentration;
		if (measurement.run3VO != null) {
			measurement.energy = measurement.run3VO.energy;
			measurement.expExposureTemperature = measurement.run3VO.exposureTemperature;
			measurement.storageTemperature = measurement.run3VO.storageTemperature;
			measurement.timePerFrame = measurement.run3VO.timePerFrame;
			measurement.radiationAbsolute = measurement.run3VO.radiationAbsolute;
			measurement.radiationRelative = measurement.run3VO.radiationRelative;
			measurement.status = "DONE";

			try {
				
				if (measurement.run3VO.timeStart != null) {
					if (measurement.run3VO.timeStart != "") {
						measurement.miliseconds = moment(measurement.run3VO.timeStart).format("X");
					}
				}
			} catch (E) {
				console.log(E);
			}
		}

		if (experiments.getDataCollectionByMeasurementId(measurement.measurementId).length > 0) {
			var measurementtodatacollection3VOs = experiments.getDataCollectionByMeasurementId(measurement.measurementId)[0].measurementtodatacollection3VOs;
			for (var k = 0; k < measurementtodatacollection3VOs.length; k++) {
				if (measurementtodatacollection3VOs[k].dataCollectionOrder == 1) {
					var specimenBuffer = experiments.getSampleById(experiments.getMeasurementById(measurementtodatacollection3VOs[k].measurementId).specimenId);
					if (specimenBuffer.sampleplateposition3VO != null) {
						measurement.bufferSampleplateposition3VO = specimenBuffer.sampleplateposition3VO;
						measurement.bufferSampleplate = (experiments.getSamplePlateById(specimenBuffer.sampleplateposition3VO.samplePlateId));
					}
				}
			}
		}

		if (this.collapsed) {
			/** If collapsed only the samples * */
			if (specimen.macromolecule3VO != null) {
				data.push(measurement);
			}
		} else {
			data.push(measurement);
		}

	}
	return data;
};

/**
 * @key name of the columns mathing the this.editor[key]
 */
MeasurementGrid.prototype._getEditor = function(key) {
	if (this.editor != null){
		if (this.editor[key] != null) {
			return this.editor[key];
		}
	}
	return null;
};

MeasurementGrid.prototype.getColumns = function() {
	var _this = this;
	var columns = [{
			text : 'Order',
			dataIndex : 'priority',
			flex : 0.3,
			hidden : _this.isPriorityColumnHidden,
			sortable : true,
			hidden : true
		},
		{
			text : 'Run Number',
			dataIndex : 'code',
			flex : 0.5,
			hidden : true,
			sortable : true
		},
		{
			text : 'Specimen',
			columns : [

					{
						text : '',
						dataIndex : 'macromoleculeId',
						flex : 1,
						hidden : true,
						sortable : true
					},
					{
						text : 'Macromolecule',
						dataIndex : 'acronym',
						flex : 1,
						sortable : true
					},
					{
						text : 'Conc. ',
						dataIndex : 'concentration',
						flex : 1,
						sortable : true
					},
					{
						text : '',
						dataIndex : 'bufferId',
						flex : 1,
						hidden : true,
						sortable : true
					},
					{
						text : 'Buffer',
						dataIndex : 'buffer_acronym',
						flex : 1,
						renderer : function(val, y, sample) {
							if (sample.data.bufferSampleplateposition3VO != null) {
								return EXI.proposalManager.getBufferById(sample.data.bufferId).acronym + "<span style='font-style:oblique;'> Plate: ["
										+ sample.data.bufferSampleplate.slotPositionColumn + ", "
										+ BUI.getSamplePlateLetters()[sample.data.bufferSampleplateposition3VO.rowNumber - 1] + "-"
										+ sample.data.bufferSampleplateposition3VO.columnNumber + "]</span>";
							}
							return val;
						},
						sortable : true
					}, {
						text : 'Position',
						flex : 1,
						hidden : true,
					} ]
		},
		{
			text : 'Parameters',
			columns : [
					{
						text : 'Ex. Flow. time (s)',
						dataIndex : 'extraFlowTime',
						flex : 1,
						hidden : true,
					},
					{
						text : 'Exp. Temp.',
						dataIndex : 'exposureTemperature',
						flex : 1,
						sortable : true,
						editor : this._getEditor("exposureTemperature")
					},
					{
						text : 'Vol. Load',
						dataIndex : 'volumeToLoad',
						flex : 0.5,
						hidden : false,
						editor : this._getEditor("volumeToLoad"),
					},
					{
						text : 'Volume in Well',
						dataIndex : 'volume',
						hidden : true,
						editor : this._getEditor("volume"),
						flex : 1
					},
					{
						text : 'Trans.',
						dataIndex : 'transmission',
						flex : 1,
						editor : this._getEditor("transmission"),
					},
					{
						text : 'Wait T.',
						dataIndex : 'waitTime',
						editor : this._getEditor("waitTime"),
						flex : 0.5
					},
					{
						text : 'Flow',
						dataIndex : 'flow',
						editor : this._getEditor("flow"),
						flex : 0.3
					},
					{
						text : 'Viscosity',
						dataIndex : 'viscosity',
						tooltip : 'The viscosity of a fluid is a measure of its resistance to gradual deformation by shear stress or tensile stress. For liquids, it corresponds to the informal notion of "thickness"',
						editor : this._getEditor("viscosity"),
						flex : 0.5
					} ]
		}, {
			text : 'Status',
			dataIndex : 'status',
//			width : 50,
			flex : 1,
			hidden : _this.isStatusColumnHidden,
			renderer : function(val, record, r){
				if (val != null){
					return "<span style='font-weight: bold;'>" + val +"</span>"
				}
			}
		}, {
			text : 'Time',
			dataIndex : 'time',
			flex : 1,
			hidden : _this.isTimeColumnHidden,
		}, {
			text : 'Energy',
			dataIndex : 'energy',
			flex : 1,
			hidden : true
		}, {
			text : 'Real Exp. Temp.(C)',
			flex : 1,
			dataIndex : 'expExposureTemperature',
			hidden : true
		}, {
			text : 'Storage Temp.(C)',
			flex : 1,
			dataIndex : 'storageTemperature',
			hidden : true
		}, {
			text : 'Time/Frame (s)',
			flex : 1,
			dataIndex : 'timePerFrame',
			hidden : true
		}, {
			text : 'Radiation Relative',
			dataIndex : 'radiationRelative',
			flex : 1,
			hidden : true
		}, {
			text : 'Radiation Absolute',
			dataIndex : 'radiationAbsolute',
			flex : 1,
			hidden : true
		}, {
			text : 'Comments',
			dataIndex : 'comments',
			flex : 1,
			hidden : true,
			editor : this._getEditor("comments")

		}, 
		{
			id : _this.id + 'buttonRemoveSample',
			text : '',
			hidden : !_this.removeBtnEnabled,
			flex : 1,
//			sortable : false,
			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
//				return "asdsad"
				if (record.data.macromoleculeId != null) {
					if (_this.removeBtnEnabled) {
						return BUI.getRedButton('REMOVE');
					}
				}
			}
		}
//		{
//			xtype : 'actioncolumn',
//			text : 'Remove',
//			flex : 1,
//			sortable : false,
//			editable : false,
//			items : [{
//			         	icon : '../images/icon/ic_delete_black_24dp.png',
//		                tooltip: 'Remove',
//		                handler: function(grid, rowIndex, colIndex) {
//		                    grid.getStore().removeAt(rowIndex);
//		                }
//			}
//			]
//		} 
		];
	return columns;
};


/**
 * If updateRowEnabled returns an array with Ext.grid.plugin.RowEditing
 */
MeasurementGrid.prototype._getPlugins = function() {
	var _this = this;
	var plugins = [];
	if (this.updateRowEnabled) {
		plugins.push(Ext.create('Ext.grid.plugin.RowEditing', {
			clicksToEdit : 1,
			listeners : {
				validateedit : function(grid, e) {
					/** Setting values * */
					for ( var key in _this.editor) {
						e.record.data[key] = e.newValues[key];
					}
					/** Comments are always updatable* */
					e.record.data.comments = e.newValues.comments;
					
					var onSuccess = (function(sender, measurement) {
						_this.onMeasurementChanged.notify(measurement);
						_this.grid.setLoading(false);
					});
					_this.grid.setLoading();
					EXI.getDataAdapter({onSuccess : onSuccess}).saxs.measurement.saveMeasurement(e.record.data);
				}
			}
		}));
	}
	return plugins;
};


/** Returns the grid **/
MeasurementGrid.prototype.getPanel = function() {
	var _this = this;

	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'macromoleculeId', 'name', 'acronym', 'comments' ],
		data : [],
		sorters : this.sorter
	});


	if (this.multiselect) {
		this.selModel = Ext.create('Ext.selection.CheckboxModel', {
			multiSelect : this.multiselect,
			listeners : {
				selectionchange : function(sm, selections) {
					var macromolecules = [];
					for ( var i = 0; i < selections.length; i++) {
						macromolecules.push(selections[i].raw);
					}
					_this.onSelected.notify(macromolecules);
				}
			}
		});
	}
	
	 var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	        clicksToEdit: 1,
	        autoCancel: true
	    });
	  
	 var bbar = {};
		try {
			bbar = Ext.create('Ext.ux.StatusBar', {
				id : _this.id + 'basic-statusbar',
				defaultText : 'Ready',
				text : 'Ready',
				iconCls : 'x-status-valid',
				items : []
			});
		} catch (exp) {
			console.log("bbar error");
		}
		
		
	this.grid = Ext.create('Ext.grid.Panel', {
		id : this.id,
		title : this.title,
		plugins : this._getPlugins(),
		margin : this.margin,
		store : this.store,
		height : this.height,
		maxHeight : this.maxHeight,
		columns : this.getColumns(),
		bbar : bbar,
		tbar :  this._getMenu(),
		cls : 'border-grid',
		viewConfig : {
			stripeRows : true,
			getRowClass : function(record, index, rowParams, store) {
				if (record.data.status == "DONE") {
					return 'green-row';
				}
			},
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				},
				'cellclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					if (td.innerHTML.indexOf("REMOVE") != -1){
						grid.getStore().removeAt(rowIndex);
					
						
						if (record.data.measurementId != null) {
							/** For testing * */
							grid.setLoading("ISPyB: Removing measurement");
							var onSuccess = (function(sender, data) {
								grid.setLoading(false);
								/**
								 * We get and refresh experiment
								 * because specimens has changed *
								 */
								var onExperimentRetrievedSuccess =  (function(sender, experiment) {
									_this.onRemoved.notify(experiment);
									_this._showStatusBarReady('Ready');
								});
								EXI.getDataAdapter({onSuccess : onExperimentRetrievedSuccess}).saxs.experiment.getExperimentById(_this.experimentList.experiments[0].experimentId, "MEDIUM");
								_this._showStatusBarBusy("ISPyB: Removing Unused Specimens");
							});
							EXI.getDataAdapter({onSuccess : onSuccess}).saxs.measurement.removeMeasurement(record.data);
						}
					}
				}

			}
		}
	});
	return this.grid;
};

/**
 * Set status bar to ready (ok icon)
 * 
 * @msg message to be displayed on the bar
 */
MeasurementGrid.prototype._showStatusBarReady = function(msg) {
	var statusBar = Ext.getCmp(this.id + 'basic-statusbar');
	statusBar.setStatus({
		text : msg,
		iconCls : 'x-status-valid',
		clear : false
	});
};

/**
 * Set status bar to busy (refreshing icon)
 * 
 * @msg message to be displayed on the bar
 */
MeasurementGrid.prototype._showStatusBarBusy = function(msg) {
	var statusBar = Ext.getCmp(this.id + 'basic-statusbar');
	statusBar.setStatus({
		text : msg,
		iconCls : 'x-status-busy',
		clear : false
	});
};

/** Opens WizardWidget for adding new measurements * */
MeasurementGrid.prototype._openAddMeasurementWindow = function(measurements, experiments) {
	var _this = this;
	var wizardWidget = new WizardWidget({
		windowMode : true,
		width : 1200
	});
	wizardWidget.onFinished.attach(function(sender, result) {
		_this.grid.setLoading();
		wizardWidget.window.close();
		var onSuccess = (function(sender, data) {
			_this.onExperimentChanged.notify(data);
			_this.grid.setLoading(false);
			
		});
		wizardWidget.current.setLoading("ISPyB: Adding measurements");
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.template.saveTemplate(result.name, result.comments, result.data, _this.experimentList.experiments[0].experimentId);
	});

	wizardWidget.draw(null, new MeasurementCreatorStepWizardForm(EXI.proposalManager.getMacromolecules(),EXI.proposalManager.getBuffers(), {
		noNext : true
	}));
};

MeasurementGrid.prototype._getMenu = function() {
	var _this = this;
	if (this.tbar) {

		var items = [];
		if (_this.addBtnEnable) {
			items.push({
				icon: '../images/icon/add.png',
				text : 'Add',
				handler : function() {
					_this._openAddMeasurementWindow();
				}
			});
		}


		if (_this.sortingBtnEnable) {
			var split = Ext.create('Ext.button.Split', {
				text : 'Sort by',
				icon: '../images/icon/sort.png',
				handler : function() {
				},
				menu : new Ext.menu.Menu({
					items : [
					{
						text : 'First Created First Measured',
						handler : function() {
							_this._sortBy("FIFO");
						}
					}, "-", {
						text : 'Default',
						handler : function() {
							_this._sortBy("DEFAULT");
						}
					} ]
				})
			});
			items.push(split);
		}

		if (_this.collapseBtnEnable) {
			items.push({
				text : 'Collapse buffers',
				enableToggle : true,
				scope : this,
				toggleHandler : function(item, pressed) {
					this.collapsed = pressed;
					this.grid.getStore().loadData(this._prepareData(this.measurements, this.experiments), false);
				},
				pressed : this.collapsed
			});
		}

		var tb = Ext.create('Ext.toolbar.Toolbar', {
			cls : 'exi-top-bar',
			 height : 45,
			items : items
		});
		return tb;
	}
	return null;
};

MeasurementGrid.prototype._sortBy = function(sort) {
	var _this = this;
	var adapter = new DataAdapter();
	var onSuccess = (function(sender, data) {
		_this.onExperimentChanged.notify(data);
		_this.grid.setLoading(false);
	});
	_this.grid.setLoading("Sorting");
	EXI.getDataAdapter({onSuccess : onSuccess}).saxs.measurement.sortMeasurements(this.experimentList.experiments[0].experimentId, sort);
};