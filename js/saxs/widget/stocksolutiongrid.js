





/**
 * Shows a list of stock solutions with macromolecule, buffer, storage temperature, concentration, shipment and comments
 * 
 * @multiselect allows multiple selection
 * @height 
 * @minHeight
 * @width
 * @tbar
 * @showTitle
 * @isPackedVisible shows is stock solution is in a box
 * @btnEditVisible shows edit button
 * @btnAddVisible
 * @btnAddExisting
 * @btnUnpackVisible allows to unpack a stock solution
 * @btnRemoveVisible allow to remove a stock solution
 */

function StockSolutionGrid(args) {
	this.id = BUI.id();
//	this.height = 100;
//	this.width = null;
//	this.minHeight = null;
	this.tbar = true;

	this.title = "Stock Solutions";

	/** Visible buttons and actions **/
	this.btnEditVisible = true;
	this.btnRemoveVisible = true;
	this.btnAddVisible = true;
	this.btnAddExisting = false;
	this.isPackedVisible = true;
	this.btnUnpackVisible = false;

	/** Selectors **/
	this.multiselect = false;
	this.selectedStockSolutions = [];

	if (args != null) {
		if (args.btnUnpackVisible != null) {
			this.btnUnpackVisible = args.btnUnpackVisible;
		}
		if (args.multiselect != null) {
			this.multiselect = args.multiselect;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.btnEditVisible != null) {
			this.btnEditVisible = args.btnEditVisible;
		}
		if (args.btnAddVisible != null) {
			this.btnAddVisible = args.btnAddVisible;
		}
		if (args.btnAddExisting != null) {
			this.btnAddExisting = args.btnAddExisting;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.minHeight != null) {
			this.minHeight = args.minHeight;
		}
		if (args.tbar != null) {
			this.tbar = args.tbar;
		}
		if (args.btnRemoveVisible != null) {
			this.btnRemoveVisible = args.btnRemoveVisible;
		}
		if (args.isPackedVisible != null) {
			this.isPackedVisible = args.isPackedVisible;
		}
		if (args.showTitle != null) {
			this.showTitle = args.showTitle;
			if (this.showTitle == false) {
				this.title = null;
			}
		}

	}

	/** Events **/
//	this.onProposalChanged = new Event(this);
//	this.onStockSolutionSelected = new Event(this);
	this.onSaved = new Event(this);
	this.onUnpack = new Event(this);
	this.onPack = new Event(this);
}

StockSolutionGrid.prototype._getColumns = function() {
	var _this = this;
	var columns = [
	{
		header : 'Proposal',
		dataIndex : 'proposal',
		name : 'proposalId',
	//	type : 'string',
		flex : 1,
		hidden : false
	}, 
	{
		header : 'Macromolecule',
		dataIndex : 'macromolecule',
		id : _this.id + 'macromolecule',
		type : 'string',
		renderer : function(val, y, specimen) {
			if (val != null){
				return '<span style="color:blue;">' + val + '</span>';
			}
		},
		hidden : false,
		flex : 1
	}, {
		header : 'Buffer',
		dataIndex : 'buffer',
		name : 'buffer',
		hidden : false,
		renderer : function(val, y, specimen) {
			return '<span style="color:green;">' + val + '</span>';
		},
		type : 'string',
		flex : 1
	}, {
		header : 'Acronym',
		dataIndex : 'name',
		name : 'name',
		flex : 1,
		hidden : true
	},{
		header : 'Storage Temp. (C)',
		dataIndex : 'storageTemperature',
		name : 'storageTemperature',
		flex : 1,
		hidden : false
	}, {
		header : 'Volume (&#181l)',
		name : 'volume',
		dataIndex : 'volume',
		flex : 1,
		hidden : false
	}, {
			header : 'Concentration (mg/ml)',
			dataIndex : 'concentration',
			name : 'concentration',			
			flex : 1
	}, 
	{
		header : 'Packed',
		dataIndex : 'comments',
		id : _this.id + "box",
		type : 'string',
		width : 50,
		hidden : !this.isPackedVisible,
		renderer : function(val, cmp, a) {
			if (a.raw.boxId != null) {
				return "<div style='cursor: pointer;'><img height='15px' src='../images/plane.gif'></div>";
			}

		}
	}, 
	{
		header : 'Comments',
		dataIndex : 'comments',
		type : 'string',
		flex : 1
	} ];

	if (this.btnEditVisible) {
//		columns.push({
//			id : _this.id + 'buttonEdit',
//			width : 85,
//			sortable : false,
//			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
//				if (_this.btnEditVisible) {
//					return BUI.getGreenButton('EDIT');
//				}
//			}
//		});
		columns.push({
            xtype:'actioncolumn',
            width:40,
            text : 'Edit',
            items: [{
                icon: '../images/icon/edit.png',  // Use a URL in the icon config
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    _this.edit(rec.get('stockSolutionId'));
                }
            }]
        });
	}

	if (this.btnRemoveVisible) {
		columns.push({
			id : _this.id + 'buttonRemove',
			width : 85,
			sortable : false,
			renderer : function(value, metaData, record, rowIndex, colIndex, store) {
				if (_this.btnRemoveVisible) {
					return BUI.getRedButton('REMOVE');
				}
			}
		});
	}

	if (this.btnUnpackVisible) {
//		unpack
		columns.push({
            xtype:'actioncolumn',
            width:40,
            text : 'Unpack',
            items: [{
                icon: '../images/icon/ic_highlight_remove_black_24dp.png',  // Use a URL in the icon config
                tooltip: 'Unpack',
                handler: function(grid, rowIndex, colIndex) {
                    var stockSolution = grid.getStore().getAt(rowIndex).data;
                    _this.unpack(stockSolution);
                }
            }]
        });
	}
	return columns;
};

StockSolutionGrid.prototype._getTopButtons = function() {
	var _this = this;
	/** Actions buttons **/
	var actions = [];

	/** ADD BUTTON **/
	if (this.btnAddVisible) {
		actions.push(Ext.create('Ext.Action', {
			icon: '../images/icon/add.png',
			text : 'Add',
			tooltip : 'Will create a new stock solution',
			disabled : false,
			alwaysEnabled : true,
			handler : function(widget, event) {
				_this.edit();
			}
		}));
	}

	if (this.btnAddExisting) {
		actions.push(Ext.create('Ext.Action', {
			icon: 'images/icon/add.png',
			text : 'Add Existing',
			tooltip : 'Allows to select upacked stock solutions',
			disabled : false,
			alwaysEnabled : true,
			handler : function(widget, event) {
				var stockSolutionGrid = new StockSolutionGrid({
					btnAddVisible : false,
					btnEditVisible : false,
					btnRemoveVisible : false,
					btnAddExisting : false,
					isPackedVisible : false,
					multiselect : true
				});

				var window = Ext.create('Ext.window.Window', {
					title : 'Select',
					height : 800,
					width : 900,
					layout : 'fit',
					items : [ stockSolutionGrid.getPanel() ],
					buttons : [ {
						text : 'Pack',
						handler : function() {
							if (stockSolutionGrid.selectedStockSolutions.length > 0){
								_this.onPack.notify(stockSolutionGrid.selectedStockSolutions[0]);
							}
							window.close();
						}
					}, {
						text : 'Cancel',
						handler : function() {
							window.close();
						}
					} ]

				}).show();

				stockSolutionGrid.load(EXI.proposalManager.getUnpackedStockSolutions());
			}
		}));
	}

	return actions;
};

StockSolutionGrid.prototype.load = function(stockSolutions) {
	var data = [];
	for ( var i = 0; i < stockSolutions.length; i++) {
		var stockSolution = stockSolutions[i];
		if (EXI.proposalManager.getBufferById(stockSolution.bufferId) != null){
			stockSolution.buffer = EXI.proposalManager.getBufferById(stockSolution.bufferId).acronym;
		}
		stockSolution.proposal = EXI.proposalManager.getProposalById(stockSolution.proposalId).code + EXI.proposalManager.getProposalById(stockSolution.proposalId).number;
		if (EXI.proposalManager.getMacromoleculeById(stockSolution.macromoleculeId) != null){
			stockSolution.macromolecule = EXI.proposalManager.getMacromoleculeById(stockSolution.macromoleculeId).acronym;
		}
		data.push(stockSolution);
	}
	
	
	this.store.loadData(data, false);
};

StockSolutionGrid.prototype.getPanel = function() {
	return this._renderGrid();
};

StockSolutionGrid.prototype.edit = function(stockSolutionId) {
	var _this = this;
	var stockSolutionWindow = new StockSolutionWindow();
	/** On stock solution SAVED **/
	stockSolutionWindow.onSaved.attach(function(sender, stockSolution) {
		_this.onSaved.notify(stockSolution);
	});
	stockSolutionWindow.draw(EXI.proposalManager.getStockSolutionById(stockSolutionId));
};

StockSolutionGrid.prototype.unpack = function(stockSolution) {
	this.onUnpack.notify(stockSolution);
};

StockSolutionGrid.prototype._renderGrid = function() {
	var _this = this;

	/** Store **/
	this.store = Ext.create('Ext.data.Store', {
		fields :  ['proposalId',  'name', 'stockSolutionId', 'macromolecule', 'buffer', 'storageTemperature', 'volume', 'concentration', 'buffer', 'comments'],
		autoload : true
	});

	var filters = {
		ftype : 'filters',
		local : true,
		filters : this.filters
	};

	var selModel = null;

	if (this.multiselect) {
		selModel = Ext.create('Ext.selection.CheckboxModel', {
			mode : 'SINGLE',
			listeners : {
				selectionchange : function(sm, selections) {
					_this.selectedStockSolutions = [];
					for ( var i = 0; i < selections.length; i++) {
						_this.selectedStockSolutions.push(selections[i].data);
					}
				}
			}
		});
	} else {
		selModel = {
			mode : 'SINGLE'
		};
	}

	this.store.sort("stockSolutionId", "desc");

	this.grid = Ext.create('Ext.grid.Panel', {
//		style : {
//			padding : 5
//		},
		margin : 10,
		cls : 'defaultGridPanel',
		title : this.title,
//		height : this.height,
//		width : this.width,
//		minWidth : this.minWidth,
		selModel : selModel,
		store : this.store,
		columns : this._getColumns(),
		viewConfig : {
			stripeRows : true,
			listeners : {
				itemdblclick : function(dataview, record, item, e) {
					_this.edit(record.data.stockSolutionId);
				},
				cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					var adapter = null;
//					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonUnpack') {
//						_this.grid.setLoading("ISPyB: Unpacking stock solution");
//						adapter = new DataAdapter();
//						adapter.onSuccess.attach(function(sender) {
//							_this.onProposalChanged.notify();
//							_this.grid.setLoading(false);
//						});
//						adapter.onError.attach(function(sender) {
//							_this.onProposalChanged.notify();
//							_this.grid.setLoading(false);
//						});
//						record.raw.boxId = null;
//						adapter.saveStockSolution(record.raw);
//					}

					if (grid.getGridColumns()[cellIndex].getId() == _this.id + "box") {
						window.location = BUI.getShippingURL(BIOSAXS.proposal.getShipmentByDewarId(record.raw.boxId).shippingId);
					}
//					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonEdit') {
//						_this.edit(record.data.stockSolutionId);
//					}

					if (grid.getGridColumns()[cellIndex].getId() == _this.id + 'buttonRemove') {
						_this.grid.setLoading("ISPyB: Removing stock solution");
						adapter = new BiosaxsDataAdapter();
						adapter.onSuccess.attach(function(sender) {
							_this.onProposalChanged.notify();
							_this.grid.setLoading(false);
						});
						adapter.onError.attach(function(sender) {
							_this.onProposalChanged.notify();
							_this.grid.setLoading(false);
						});
						adapter.removeStockSolution(record.data.stockSolutionId);
					}
				}
			}
		}

	});

	var actions = _this._getTopButtons();
//	this.grid.addDocked({
//		xtype : 'toolbar',
//		height : 50,
//		items : actions
//	});

	var i = null;
	this.grid.getSelectionModel().on({
		selectionchange : function(sm, selections) {
			if (selections.length) {
				for ( i = 0; i < actions.length; i++) {
					if (actions[i].enable) {
						actions[i].enable();
					}
				}
			} else {
				for ( i = 0; i < actions.length; i++) {
					if (actions[i].alwaysEnabled == false) {
						if (actions[i].disable) {
							actions[i].disable();
						}
					}
				}
			}
		}
	});
	return this.grid;
};

//StockSolutionGrid.prototype.input = function() {
//	return {
//		proposal : DATADOC.getProposal_10()
//	};
//};
//
//StockSolutionGrid.prototype.test = function(targetId) {
//	var stockSolutionGrid = new StockSolutionGrid({
//		height : 300,
//		width : 900
//	});
//	BIOSAXS.proposal = new Proposal(stockSolutionGrid.input().proposal);
//	var panel = stockSolutionGrid.getPanel();
//	stockSolutionGrid.load(BIOSAXS.proposal.getStockSolutions());
//	panel.render(targetId);
//};






































