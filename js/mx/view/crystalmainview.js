function CrystalMainView() {
	this.icon = 'images/icon/ic_satellite_black_18dp.png';
	MainView.call(this);
	var _this = this;
	
	this.crystalForm = new CrystalForm();
	this.samplesGrid = new SamplesGrid();
}

CrystalMainView.prototype.getPanel = MainView.prototype.getPanel;

CrystalMainView.prototype.getContainer = function() {
	this.panel =  Ext.createWidget('tabpanel',
			{
				plain : true,
				margin : '10 30 10 10',
				items : [
					{
						tabConfig : {
							title : 'Samples list'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							style : {
								borderColor : 'gray',
								borderStyle : 'solid',
								borderWidth : '1px',
								'background-color' : 'white' 
							},
							items : 
								[
									this.samplesGrid.getPanel()
							]
						}
						]
				  },
				  {
						tabConfig : {
							title : 'Create a new CrystalForm'
						},
						items : [ {
							xtype : 'container',
							layout : 'fit',
							style : {
								borderColor : 'gray',
								borderStyle : 'solid',
								borderWidth : '1px',
								'background-color' : 'white' 
							},
							items : 
								[
							        this.crystalForm.getPanel()
							]
						}
						]
				  }]
		});
	return this.panel;	
};

CrystalMainView.prototype.load = function(crystal) {
	var _this = this;
	this.panel.setTitle(crystal.proteinVO.acronym);
	this.crystalForm.load(crystal);
	this.samplesGrid.load(crystal);
	
};
















