/**
 * It shows buffer grid with a top bar with "Add" button
 * 
 * @height
 * @searchBar
 * @collapsed
 * @width
 */
function BufferGrid(args) {
	this.height = 500;
	this.searchBar = false;
	this.tbar = false;
	this.collapsed = false;
	this.id = BUI.id();

	this.collapsible = false;
	
	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.searchBar != null) {
			this.searchBar = args.searchBar;
		}

		if (args.tbar != null) {
			this.tbar = args.tbar;
		}

		if (args.collapsed != null) {
			this.collapsed = args.collapsed;
		}

		if (args.width != null) {
			this.width = args.width;
		}
	}
	
	this.onUpdated = new Event(this);
}

BufferGrid.prototype._edit = function(bufferId) {
	var _this = this;
	function getButtons(){
				return [ {
					text : 'Save',
					handler : function() {
						var onSuccess = function(sender) {
							var onSuccess2 = function(sender, proposals){
								_this.window.close();
								_this.onUpdated.notify();
								_this.panel.setLoading(false);
							};
							_this.panel.setLoading("Updading proposal information");
							EXI.getDataAdapter({onSuccess : onSuccess2}).proposal.proposal.update();
							
						};
						/** Checking mandatory fields **/
						if (_this.bufferForm.getBuffer().name == ""){
							BUI.showWarning("Name field is mandatory");
							return;
						}
						if (_this.bufferForm.getBuffer().acronym == ""){
							BUI.showWarning("Acronym field is mandatory");
							return;
						}
						if ((_this.bufferForm.getBuffer().proposalId == "") || (_this.bufferForm.getBuffer().proposalId == null)){
							BUI.showWarning("Proposal field is mandatory");
							return;
						}
						EXI.getDataAdapter({onSuccess : onSuccess}).saxs.buffer.saveBuffer(_this.bufferForm.getBuffer());
					}
				}, {
					text : 'Cancel',
					handler : function() {
						_this.window.close();
					}
				}];
	}

	this.bufferForm = new BufferForm({height : 400, width : 700});
	
	this.window = Ext.create('Ext.window.Window', {
	    title: 'Edit buffer',
	    layout: 'fit',
	    items: this.bufferForm.getPanel(),
	    buttons			: getButtons(),
	}).show();
	
	this.bufferForm.load(this.getBufferById(bufferId));
};

BufferGrid.prototype.getBufferById = function(bufferId) {
	for (var i = 0; i < this.buffers.length; i++) {
		if (this.buffers[i].bufferId == bufferId){
			return this.buffers[i];
		}
	}
	return {};
};

BufferGrid.prototype.load = function(buffers) {
	var _this = this;
	/** Retrieving proposals **/
	this.buffers = buffers;
	
	this.proposalKey = {};
	this.proposalColor = {};
	var colors = ["#006633", "#999966", "#CC0066"];
	for (var i = 0; i < buffers.length; i++) {
		var proposal = EXI.proposalManager.getProposalById(buffers[i].proposalId);
		buffers[i]["proposal"] = proposal.code + proposal.number;
	}
	this.store.loadData(buffers, false);
};

BufferGrid.prototype._getTbar = function() {
	var _this = this;
	var actions = [];

	actions.push(Ext.create('Ext.Action', {
		text : 'Add',
		icon: 'images/icon/add.png',
		disabled : false,
		handler : function(widget, event) {
			_this._edit();
		}
	}));
	return actions;
};

BufferGrid.prototype.getPanel = function() {
	var _this = this;

	this.store = Ext.create('Ext.data.Store', {
		fields : [ 'proposal', 'bufferId', 'acronym', 'name', 'composition', 'comments', 'ph' ]
	});

	this.store.sort('acronym');

	var type = 'Ext.grid.Panel';
	if (this.searchBar == true) {
		type = 'Ext.ux.LiveSearchGridPanel';
	}

	this.panel = Ext.create(type, {
		title : 'Buffers',
		collapsible : this.collapsible,
		collapsed : this.collapsed,
		store : this.store,
		height : this.height,
		width : this.width,
		columns : [ 
		{
			text : 'Proposal',
			dataIndex : 'proposal',
			flex : 1
		}, 
		{
			text : 'Acronym',
			dataIndex : 'acronym',
			flex : 2
		}, {
			text : 'Name',
			dataIndex : 'name',
			flex : 2,
			hidden : false
		}, {
			text : 'pH',
			dataIndex : 'ph',
			flex : 2
		},{
			text : 'Composition',
			dataIndex : 'composition',
			flex : 2,
			hidden : false
		}, 
		{
			text : 'Comments',
			dataIndex : 'comments',
			flex : 4,
			hidden : false
		}, 
		 {
            xtype:'actioncolumn',
            width:40,
            text : 'Edit',
            items: [{
                icon: 'images/icon/edit.png',  // Use a URL in the icon config
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    _this._edit(rec.get('bufferId'));
                }
            }]
        }
		],
		flex : 1,
		viewConfig : {
			stripeRows : true,
			listeners : {
				'celldblclick' : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					_this._edit(record.data.bufferId);
				}
			}
		}
	});

	/** Adding the tbar **/
	if (this.tbar) {
		this.panel.addDocked({
			xtype : 'toolbar',
			cls : 'toolBarGrid',
			height : 48,
			items : this._getTbar()
		});
	}
	return this.panel;
};

BufferGrid.prototype.input = function() {
	return new MacromoleculeGrid().input();
};

BufferGrid.prototype.test = function(targetId) {
	var bufferGrid = new BufferGrid({
		width : 800,
		height : 350,
		collapsed : false,
		tbar : true
	});

	BIOSAXS.proposal = new Proposal(bufferGrid.input().proposal);
	var panel = bufferGrid.getPanel(BIOSAXS.proposal.macromolecules);
	panel.render(targetId);
};



