function LigandsMainView() {
	this.id = BUI.id();

	
}

LigandsMainView.prototype.getToolbar = function (sessions) {
	var _this = this;
	return Ext.create('Ext.toolbar.Toolbar', {
		items: {
            // xtype: 'button', // default for Toolbars
			text: 'Add',
			handler : function(){								
				var editLigands = new EditCrystalStructure(
					{
						types : ["PDB", "MOL2", "CIF", "CIF_LIBRARY", "SDF"],
						label : "Cocktail Name"
					}
				);
				var window = Ext.create('Ext.window.Window', {
					title: 'Add new Ligand',
					height: 460,
					width: 600,
					modal: true,
					closable: false,
					layout: 'fit',
					items: [editLigands.getPanel()],
					buttons: [{
						text: 'Save',
						handler: function () {
							editLigands.onSaved.attach(function(sender, data){
								_this.ligands.push(data);
								_this.store.loadData(_this.ligands);	
								window.close();
							});
							editLigands.save();																											
						}
					}, {
						text: 'Cancel', 
						handler: function () {						
							window.close();
						}
					}]
				}).show();
				//var crystal = _.find(EXI.proposalManager.getCrystals(), function (o) { return o.crystalId == parseFloat(crystalId); })				
				editLigands.load();
			}
        }
	});
};

LigandsMainView.prototype.getColumns = function () {
	return [
		{

			dataIndex: 'groupName',
			text: 'Cocktail',
			flex: 1.5,
			hidden: false
			
		},
		{

			dataIndex: 'structureType',
			text: 'Type',
			flex: 1.5,
			hidden: false
			
		},
		{

			dataIndex: 'name',
			text: 'File Name',
			flex: 1.5,
			hidden: false
			
		}];
};


LigandsMainView.prototype.getPanel = function () {
	this.store = Ext.create('Ext.data.Store', {
		fields: ["groupName", "name", "Type"],
		groupField: 'groupName'
	});
	

	this.panel = Ext.create('Ext.grid.Panel', {
		border: 1,
		store: this.store,
		features: [{ftype:'grouping'}],
		id: this.id,
		dockedItems: [this.getToolbar()],		
		padding : 20,
		disableSelection: true,
		columns: this.getColumns(),
		viewConfig: {
			enableTextSelection: true,
			stripeRows: false
		}
	});
	return this.panel;
};



LigandsMainView.prototype.load = function (ligands) {	
	this.ligands = ligands;
	this.panel.setTitle("Ligands ( " + ligands.length + ")");	
	this.store.loadData(ligands);	
};















