/**
* It shows information from the autoprocessing like cells (a,b,c,alpha,beta,gamma) and also about phasing
*
* @class AutoProcIntegrationFileExplorerGrid
* @constructor
*/
/*
function AutoProcIntegrationFileExplorerGrid(args) {
	this.height = 500;
	this.tbar = false;
	this.id = BUI.id();
	
	this.preventSelection = false;
	this.maxHeight = 500;
	this.minHeight = 500;
	if (args != null) {
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.maxHeight != null) {
			this.maxHeight = args.maxHeight;
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
	
	this.onSelected = new Event(this);
	
};

AutoProcIntegrationFileExplorerGrid.prototype.load = function(data) {
	this.store.loadData(data, false);
};

AutoProcIntegrationFileExplorerGrid.prototype.selectRowByAutoProcIntegrationId = function(autoProcIntegrationId) {
	this.preventSelection = true;
	this.panel.getSelectionModel().select(this.store.find("v_datacollection_summary_phasing_autoProcIntegrationId", autoProcIntegrationId));
};

AutoProcIntegrationFileExplorerGrid.prototype.getPanel = function() {
	var _this = this;

	this.store = Ext.create('Ext.data.Store', {
		sorters : 'spaceGroup',
		fields : [ 'autoProcId',
		           'refinedCellA', 
                   'v_datacollection_summary_phasing_autoProcIntegrationId',
		           'autoProcIntegrationId',
		           'v_datacollection_summary_phasing_anomalous',
		           'v_datacollection_summary_phasing_processingPrograms',
		           'v_datacollection_summary_phasing_autoproc_space_group']
	});
    
	var selModel = Ext.create('Ext.selection.RowModel', {
		allowDeselect : true,
		mode : 'multi',
		listeners : {
			selectionchange : function(sm, selections) {
				var records = [];
				if (selections != null) {
					for (var i = 0; i < selections.length; i++) {
						records.push(selections[i].data);
					}

				
					if (!_this.preventSelection){
						_this.onSelected.notify(records);
					}
					else{
						_this.preventSelection = false;
					}
				}
			}

		} });
	
	this.panel = Ext.create('Ext.grid.Panel', {
		title : 'Auto-Processing Integration',
		store : this.store,
		selModel : selModel,
		cls : 'border-grid',
        layout : 'fit',
		//maxHeight : this.maxHeight,
		//minHeight : this.maxHeight,
		columns : [ 
            
            {
			text : 'autoProcIntegrationId',
			dataIndex : 'processingPrograms',
            flex : 1,
            hidden : true,
			renderer : function(e, sample, record){
                return record.data.v_datacollection_summary_phasing_autoProcIntegrationId;
			}
		},
        {
			text : 'Autoprocessing',
			dataIndex : 'processingPrograms',
            flex : 1,
			renderer : function(e, sample, record){
				return record.data.v_datacollection_summary_phasing_processingPrograms;
			}
		},
        {
			text : 'Space Group',
            flex : 0.75,
			dataIndex : 'v_datacollection_summary_phasing_autoproc_space_group',
			renderer : function(e, sample, record){
				return record.data.v_datacollection_summary_phasing_autoproc_space_group;
			}
		},
		{
			text : 'Unit cell',
			dataIndex : 'processingPrograms',
			flex : 1.5,
			renderer : function(e, sample, record){
				var html  = "";
				try{
					dust.render("AutoProcIntegrationFileExplorerGrid_autoprocolumn", record.data, function(err, out){
						html = out;
					});
				}
				catch(e){
					return "Parsing error";
				}
				return html;
			}
		},
		{
			text : 'Statistics',
			dataIndex : 'processingPrograms',
			flex : 3,
			renderer : function(e, sample, record){
				try{
					var type = record.data.scalingStatisticsType.split(",");
					var resolutionLimitLow = record.data.resolutionLimitLow.split(",");
					var resolutionLimitHigh = record.data.resolutionLimitHigh.split(",");
					var multiplicity = record.data.multiplicity.split(",");
					var meanIOverSigI = record.data.meanIOverSigI.split(",");
					var completeness = record.data.completeness.split(",");
					
					var parsed = [];
					for (var i = 0; i < type.length; i++) {
						parsed.push({
							type 					: type[i],
							resolutionLimitLow 		: resolutionLimitLow[i],
							resolutionLimitHigh 	: resolutionLimitHigh[i],
							multiplicity 			: multiplicity[i],
							meanIOverSigI 			: meanIOverSigI[i],
							completeness 			: completeness[i]
							
						});
					}
					var html  = "";
					dust.render("AutoProcIntegrationFileExplorerGrid_statistics", parsed, function(err, out){
						html = out;
					});
				}
				catch(e){
					return "<span class='summary_datacollection_parameter_name'>Not found</span>";
				}
				return html;
			}
		},
		{
			text : 'Phasing',
			dataIndex : 'processingPrograms',
            hidden : true,
			flex : 1.5,
			renderer : function(e, sample, record){
				var html  = "";
				if (record.data.phasingStepType){			
					try{
						dust.render("AutoProcIntegrationFileExplorerGrid_phasing", record.data, function(err, out){
							html = out;
						});
					}
					catch(e){
						return "Parsing error";
					}
				}
				return html;
			}
		}
		
		],
		flex : 1,
		viewConfig : {
			//stripeRows : true,
			preserveScrollOnRefresh: true,
			listeners : {
			}
		}
	});

	return this.panel;
};


*/

