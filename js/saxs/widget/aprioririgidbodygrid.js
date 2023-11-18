

/**
 * Rigid body grid to show PDB, symmetry and multiplicity
 * 
 * 
 * #onUploadFile click on upload file
 */
function AprioriRigidBodyGrid(args) {

	this.height = 250;
	this.btnEditVisible = true;
	this.btnRemoveVisible = true;

	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.btnEditVisible != null) {
			this.btnEditVisible = args.btnEditVisible;
		}
		if (args.btnRemoveVisible != null) {
			this.btnRemoveVisible = args.btnRemoveVisible;
		}
	}

	/** Events **/
	this.onUploadFile = new Event(this);
	this.onRemove = new Event(this);
}

AprioriRigidBodyGrid.prototype._getColumns = function() {
};

AprioriRigidBodyGrid.prototype._getTopButtons = function() {
	var _this = this;
	/** Actions buttons **/
	var actions = [];

	/** ADD BUTTON **/
	actions.push(Ext.create('Ext.Action', {
		icon : '../images/add.png',
		text : 'Add',
		disabled : false,
		handler : function(widget, event) {
			_this.onAddButtonClicked.notify();
		}
	}));

	return actions;
};

AprioriRigidBodyGrid.prototype.load = function(macromolecule) {
	this.macromolecule = macromolecule;
	if (macromolecule != null){
		this.pdbStore.loadData(macromolecule.structure3VOs);
	}
};

AprioriRigidBodyGrid.prototype._prepareData = function() {
	var data = [];
	for ( var i = 0; i < this.features.length; i++) {
		data.push(this.features[i]);
	}
	return data;
};



AprioriRigidBodyGrid.prototype._updateProposalInformation = function() {
	
	EXI.proposalManager.get(true);
	this.load(EXI.proposalManager.getMacromoleculeById(this.macromolecule.macromoleculeId));
	this.panel.setLoading(false);
	
};

AprioriRigidBodyGrid.prototype._getPlugins = function() {
	var _this = this;
	var plugins = [];
	plugins.push(Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToEdit : 1,
		listeners : {
			validateedit : function(grid, e) {
				/** Comments are always updatable* */
				var multiplicity = e.newValues.multiplicity;
				var symmetry = e.newValues.symmetry;
				var macromoleculeId = e.record.data.macromoleculeId;
				var structureId = e.record.data.structureId;
				
				_this.panel.setLoading();
				var onSuccess = function (){
					_this._updateProposalInformation();
				};
				
				var onError = function (error){
					BUI.showError("Ops, there was a problem");
					_this._updateProposalInformation();
				};

				_this.panel.setLoading();
				EXI.getDataAdapter({
					onSuccess : onSuccess,
					onError : onError
				}).saxs.macromolecule.saveStructure(macromoleculeId, structureId, multiplicity, symmetry);
			}
		}
	}));
	return plugins;
};

AprioriRigidBodyGrid.prototype.getPanel = function() {
	var _this = this;

	this.pdbStore = Ext.create('Ext.data.Store', {
		fields : [ 'filePath', 'structureId', 'structureType', 'symmetry', 'structureId', 'name', 'multiplicity' ],
		groupField : 'structureType',
		sorters : {
			property : 'structureId',
			direction : 'DESC'
		}
	});


	this.panel = Ext.create('Ext.grid.Panel', {
		margin : "15 10 0 10",
		height : this.height,
		store : this.pdbStore,
		plugins : _this._getPlugins(),
		cls : 'border-grid',
		tbar : [ {
			text : 'Add Modeling Option (PDB)',
			icon : '../images/icon/add.png',
			handler : function() {
				_this.onUploadFile.notify('PDB', 'Upload PDB File');
			}
		}
		],
		columns : [
				{
					text : "structureId",
					flex : 0.2,
					hidden : true,
					dataIndex : 'structureId',
					sortable : true
				},
				{
					text : "File",
					flex : 1,
					dataIndex : 'filePath',
					sortable : true,
					hidden : true
				},
				{
					text : "PDB",
					flex : 0.4,
					dataIndex : 'name',
					sortable : true
				},
				{
					text : "Symmetry",
					flex : 0.2,
					dataIndex : 'symmetry',
					sortable : true,
					editor : {
						xtype : 'combobox',
						typeAhead : true,
						triggerAction : 'all',
						selectOnTab : true,
						store : [ [ "P1", "P1" ], [ "P2", "P2" ], [ "P3", "P3" ], [ "P4", "P4" ], [ "P5", "P5" ], [ "P6", "P6" ], [ "P32", "P32" ], [ "P42", "P42" ],
								[ "P52", "P52" ], [ "P62", "P62" ], [ "P222", "P222" ] ],
					}
				}, {
					text : "Multiplicity",
					flex : 0.2,
					dataIndex : 'multiplicity',
					sortable : true,
					editor : {
						xtype : 'textfield'
					}

				}, {
					text : "Subunit",
					flex : 0.2,
					dataIndex : 'isSubunit',
					sortable : true,
					hidden : true
				}, {
					text : "Type",
					flex : 0.2,
					dataIndex : 'structureType',
					sortable : true,
					hidden : true
				},
				{
		            xtype:'actioncolumn',
		            flex : 0.1,
		            text : 'Remove',
		            editor : {
						xtype : 'textfield'
					},

		            items: [{
		                icon: '../images/icon/ic_delete_black_24dp.png',  // Use a URL in the icon config
		                tooltip: 'Remove',
		                handler: function(grid, rowIndex, colIndex) {
		                	var rec = grid.getStore().getAt(rowIndex);
		                	
		                	var structureId = rec.data.structureId;
		                	var macromoleculeId = rec.data.macromoleculeId;
		                	function showResult(btn){
		                	       if (btn == 'yes'){
		                	    	   var onSuccess = function(){
		                	    		   _this._updateProposalInformation();
		                	    	   };
		                	    	   
		                	    	    var onError = function onSuccess(){
		                	    		   BUI.showWarning("ISPyB could not remove this structure. Have it been already used?");
		                	    		   _this._updateProposalInformation();
		           						};
		           						_this.panel.setLoading();
			                	    	EXI.getDataAdapter({
			               					onSuccess : onSuccess,
			               					onError : onError
			               				}).saxs.macromolecule.removeStructure(macromoleculeId, structureId);
		                	       }
		                	};
		                	    
		                    Ext.MessageBox.show({
		                        title:'Warning',
		                        fn: showResult,
		                        msg: 'You are removing a PDB structure option. <br />Sure?',
		                        buttons: Ext.MessageBox.YESNO,
		                        icon: Ext.MessageBox.QUESTION
		                    });
		                }
		            }]
		        }
		],
		listeners: { 
		     beforeedit: function (grid, e, eOpts) { 
		    	 	return e.column.xtype != 'actioncolumn'; 
		       } 
		 }  
				
	});

	return this.panel;
};
