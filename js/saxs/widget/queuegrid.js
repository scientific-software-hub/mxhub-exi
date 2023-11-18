function QueueGrid(args) {
//	this.height = Ext.getBody().getHeight() - 500;

	this.decimals = 3;
	this.onSelect = new Event();

	this.maxHeight = 600;
	
	this.id = BUI.id();
	this.title = 'Data Collections';
	this.key = {};
	

	this.selectionMode = 'MULTI';
	
	this.collapsible = true;
	this.collapsed = false;
	
	var _this = this;
	this.filters = [ function(item) {
		if (item.data.dataCollectionId == null) {
			return false;
		}
		if (_this.key[item.data.dataCollectionId] == null) {
			_this.key[item.data.dataCollectionId] = [];
		}
		_this.key[item.data.dataCollectionId].push(item.data);
		return item.data.macromoleculeId != null;
	} ];
	if (args!= null){
		if (args.maxHeight != null){
			this.maxHeight = args.maxHeight;
		}
		if (args.collapsible != null){
			this.collapsible = args.collapsible;
		}
		if (args.collapsed != null){
			this.collapsed = args.collapsed;
		}
		if (args.selectionMode != null){
			this.selectionMode = args.selectionMode;
		}
		if (args.title != null){
			if (args.title == false){
				this.title = null;
			}
		}
	}
	
	this.selected = []; 
	this.onSelectionChange = new Event();
	this.onDeselect = new Event(this);
	this.onSelect = new Event(this);
}

QueueGrid.prototype.getSorters = function() {
	return {};
};

QueueGrid.prototype.getSelected = function() {
	return this.selected;
};


QueueGrid.prototype.getSelectedData = function() {
	var elements = this.panel.getSelectionModel().selected.items;
	var data = [];
	for (var i = 0; i < elements.length; i++) {
		data.push(elements[i].data);
	}
	return data;
};




QueueGrid.prototype.getFields = function() {
	return [ 'experimentId', 'subtractionId', 'macromoleculeAcronym', 'priorityLevelId', 'code', 'exposureTemperature', 'concentration' ];
};

QueueGrid.prototype.getRunHTML = function(sample) {
	var dataCollectionId = sample.data.dataCollectionId;
	var table = document.createElement("table");
	if (this.key[dataCollectionId] != null) {

		this.key[dataCollectionId].sort(function(a, b) {
			return b.measurementId - a.measurementId;
		});

		for (i in this.key[dataCollectionId]) {
			var specimen = this.key[dataCollectionId][i];
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			if (specimen.measurementCode != null){
				if (specimen.macromoleculeId == null) {
					td.setAttribute("style", "padding-top:1px;width:130px;color:gray;");
					td.appendChild(document.createTextNode("# " + specimen.measurementCode));
				} else {
					td.setAttribute("style", "padding-top:1px;width:130px;font-weight:bold;");
					td.appendChild(document.createTextNode("# " + specimen.measurementCode));
				}
			}
			else{
				td.appendChild(document.createTextNode(" - "));
			}
			tr.appendChild(td);
			table.appendChild(tr);
		}

	}
	return "<table>" + table.innerHTML + "</table>";
};

QueueGrid.prototype.getPercentage = function(averaged, total) {
	var tdFrames = document.createElement("td");
	
	var color = "green";
	if (averaged == null){
		averaged = "NA";
		color = "orange";
	}
	if (total == null){
		total = "NA";
		color = "orange";
	}
	
	if ((averaged != "NA")&(total != "NA")){
		if (averaged/total >= 0.3){
			color = "orange";
		}
		if (averaged/total > 0.7){
			color = "#BCF5A9";
		}
		
		if (averaged/total < 0.3){
			color = "red";
		}
		
		
	}
	
	tdFrames.appendChild(document.createTextNode(averaged + " / " + total));
	
	tdFrames.setAttribute("style", "background-color:" + color +";");
	return tdFrames;
};

QueueGrid.prototype.getFramesHTML = function(sample) {
	var dataCollectionId = sample.data.dataCollectionId;
	var table = document.createElement("table");
	if (this.key[dataCollectionId] != null) {

		this.key[dataCollectionId].sort(function(a, b) {
			return b.measurementId - a.measurementId;
		});

		for (i in this.key[dataCollectionId]) {
			var specimen = this.key[dataCollectionId][i];
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			if (specimen.macromoleculeId == null) {
				td.setAttribute("style", "width:130px;color:gray;");
				td.appendChild(document.createTextNode(specimen.bufferAcronym));
			} else {
				td.setAttribute("style", "width:130px;font-weight:bold;");
				td.appendChild(document.createTextNode(specimen.macromoleculeAcronym));
			}
			tr.appendChild(td);
			
			tr.appendChild(this.getPercentage(specimen.framesMerge, specimen.framesCount));

			var td = document.createElement("td");
			var a = document.createElement("a");
			if (specimen.macromoleculeId == null) {
				a.setAttribute("href", BUI.getZipURLByAverageId(specimen.mergeId, specimen.measurementCode));
			} else {
				a.setAttribute("href", BUI.getZipURLBySubtractionId(specimen.subtractionId, specimen.measurementCode));
			}

			tr.appendChild(td);

			table.appendChild(tr);
		}

	}
	return "<table>" + table.innerHTML + "</table>";
};

QueueGrid.prototype.getHTMLTable = function(items) {
	var html = "";
	for (var i = 0; i < items.length; i++) {
			html = html + "<tr><td class='key_subgrid'>" + items[i].key + "</td><td class='value_subgrid'>" + items[i].value + "</td></tr>";
	}
	return "<table>" + html + "</table>";
};

QueueGrid.prototype.getImage = function(sample, name) {
	if (sample.data.macromoleculeId != null) {
		if (sample.data.subtractionId != null) {
			var url = EXI.getDataAdapter().saxs.subtraction.getImage(sample.data.subtractionId, name);
			return '<img src=' + url + '   height="70" width="70" >';
		}
	}
};


QueueGrid.prototype.getColumns = function() {
	var _this = this;
	return [
			{
				header : "dataCollectionId",
				name : "dataCollectionId",
				dataIndex : "dataCollectionId",
				flex : 1,
				hidden : true },
			{
				header : "Exp. Id",
				name : "experimentId",
				dataIndex : "experimentId",
				flex : 1,
				hidden : true },
			{
				header : "Exp. Name",
				name : "name",
				dataIndex : "name",
				flex : 1,
				hidden : true },
			{
				header : "MeasurementId",
				name : "measurementId",
				dataIndex : "measurementId",
				hidden : true,
				flex : 1,
				renderer : function(val, y, sample) {
					return sample.raw.measurementId;
				} },
			{
				header : "Date",
				name : "date",
				flex : 1,
				dataIndex : "runCreationDate",
				hidden : true },

			{
				header : "Run",
				flex : 0.2,
				name : "runNumber",
				dataIndex : "measurementCode",
				renderer : function(val, y, sample) {
					return _this.getRunHTML(sample);//"<span style='font-weight:bold;'>#" + val + "</span>";
				} },
			{
				header : "Frames (Average/Total)",
				dataIndex : "macromoleculeId",
				name : "macromoleculeAcronym",
				flex : 1,
				// locked : true,
				hidden : false,
				renderer : function(val, meta, sample) {
					return _this.getFramesHTML(sample);

				} },
			{
				text : 'Scattering',
				dataIndex : 'subtractionId',
				width : 110,
				// locked : true,
				name : 'subtractionId',
				renderer : function(val, y, sample) {
					return _this.getImage(sample, "scattering");
				} 
			},
			{
				header : "Macromolecule",
				name : "macromoleculeAcronym",
				dataIndex : "macromoleculeAcronym",
				flex : 1,
				hidden : true },
			{
				header : "Concentration",
				name : "concentration",
				flex : 0.5,
				dataIndex : "concentration",
				hidden : false,
				renderer : function(val, y, sample) {
					if (sample.data.concentration != 0) {
						return BUI.formatValuesUnits(sample.data.concentration, "mg/ml", 7, this.decimals);
					}
				} },
			{
				header : "Exp. Temp.",
				name : "bufferAcronym",
				dataIndex : "bufferAcronym",
				flex : 0.5,
				renderer : function(val, y, sample) {
					return BUI.formatValuesUnits(sample.data.exposureTemperature, "C", 10, this.decimals);
				} },
			{
				text : 'Kratky.',
				dataIndex : 'subtractionId',
				hidden : true,
				flex : 1,

				name : 'subtractionId',
				renderer : function(val, y, sample) {
					return _this.getImage(sample, "kratky");
				} 
			},
			{
				text : 'P(r).',
				hidden : true,
				flex : 1,
				dataIndex : 'subtractionId',
				type : 'string',
				renderer : function(val, y, sample) {
					return _this.getImage(sample, "density");
				}
			},
			{
				text : 'Guinier.',
				hidden : true,
				flex : 1,
				dataIndex : 'subtractionId',
				type : 'string',
				renderer : function(val, y, sample) {
					return _this.getImage(sample, "guinier");
				} 
			},
			{
				text : 'Guinier',
				name : 'Guinier',
				flex : 0.8,
				dataIndex : 'subtractionId',
				renderer : function(val, y, sample) {
					if (sample.data.macromoleculeId != null) {
						if (sample.data.subtractionId != null) {
							var items = [];
							if (sample.data.rg != null){
								items.push({
									key : "Rg",
									value : BUI.formatValuesUnits(sample.data.rg, "nm", 12, this.decimals) });
							}
							else{
								items.push({
									key : "Rg",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							
							if (sample.data.rg != null){
									items.push({
										key : "Points",
										value : "<span>" + sample.data.firstPointUsed + " - " + sample.data.lastPointUsed + " ("
												+ (sample.data.lastPointUsed - sample.data.firstPointUsed) + ")</span>" });
							}
							else{
								items.push({
									key : "Points",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							
							if (sample.data.I0 != null){
								items.push({
									key : "I0",
									value : BUI.formatValuesErrorUnitsScientificFormat(sample.data.I0, sample.data.I0Stdev, "") });
							}
							else{
								items.push({
									key : "I0",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							return _this.getHTMLTable(items);

						}
					}
				} },
			{
				text : 'Gnom',
				name : 'Gnom',
				flex : 0.7,
				dataIndex : 'subtractionId',
				renderer : function(val, y, sample) {
					if (sample.data.macromoleculeId != null) {
						if (sample.data.subtractionId != null) {
							var items = [];
							if (sample.data.rgGnom != null){
								items.push({
									key : "Rg",
									value : BUI.formatValuesUnits(sample.data.rgGnom, "nm") });
							}
							else{
								items.push({
									key : "Rg",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							
							if (sample.data.rgGnom != null){
								items.push({
									key : "Total",
									value : BUI.formatValuesUnits(sample.data.total, '') });
							}
							else{
								items.push({
									key : "Total",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							if (sample.data.dmax != null){
								items.push({
											key : "D<sub>max</sub>",
											value : BUI.formatValuesUnits(sample.data.dmax, "")
													+ "<span style='font-size:8px;color:gray;'> nm</span>" });
							}
							else{
								items.push({
									key : "D<sub>max</sub>",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}

							return _this.getHTMLTable(items);

						}
					}
				} },
			{
				text : 'Porod',
				name : 'Porod',
				flex : 1,
				dataIndex : 'subtractionId',
				renderer : function(val, y, sample) {
					if (sample.data.macromoleculeId != null) {
						if (sample.data.subtractionId != null) {
							var items = [];
							if (sample.data.volumePorod != null){
								items.push({
									key : "Volume",
									value : BUI.formatValuesUnits(sample.data.volumePorod, '')
											+ "<span style='font-size:8px;color:gray;'> nm<sub>3</sub></span>"
	
								});
							}
							else{
								items.push({
									key : "Volume",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							
							if (sample.data.volumePorod != null){
								items.push({
									key : "MM Vol. est.",
									value : Number(sample.data.volumePorod / 2).toFixed(1) + " - "
											+ Number(sample.data.volumePorod / 1.5).toFixed(1)
											+ "<span style='font-size:8px;color:gray;'>kD</span>" });
								
							}
							else{
								items.push({
									key : "MM Vol. est.",
									value : "<span class='notavailablefield'>NA</span>"
								});
							}
							
							return _this.getHTMLTable(items);

						}
					}
				}
			},
				{
				text : 'Advanced',
				hidden : false,
				id : this.id + 'buttonAction',
				dataIndex : 'subtrationId',
				flex : 1,
				renderer : function(val, y, sample) {
					// 'fitCount', 'superposisitionCount', 'rigidbodyCount',
					// 'abinitioCount'
					
					var html = "<table><tr><td style='padding-bottom: 1px;'>" + BUI.getGreenButton("Data Reduction", {
						width : 90,
						height : 15 }) + "</td></tr>";
					
					if (sample.data.abinitioCount > 0) {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getGreenButton("Abinitio", {
							width : 90,
							height : 15 }) + "</td></tr>";
					} else {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getBlueButton("Abinitio", {
							width : 90,
							height : 15 }) + "</td></tr>";
					}

					if (sample.data.fitCount > 0) {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getGreenButton("Fit", {
							width : 90,
							height : 15 }) + "</td></tr>";
					} else {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getBlueButton("Fit", {
							width : 90,
							height : 15 }) + "</td></tr>";
					}

					if (sample.data.superposisitionCount > 0) {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getGreenButton("Superposition", {
							width : 90,
							height : 15 }) + "</td></tr>";
					} else {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getBlueButton("Superposition", {
							width : 90,
							height : 15 }) + "</td></tr>";
					}
					if (sample.data.rigidbodyCount > 0) {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getGreenButton("Rigid Body", {
							width : 90,
							height : 15 }) + "</td></tr>";
					} else {
						html = html + "<tr><td style='padding-bottom: 1px;'>" + BUI.getBlueButton("Rigid Body", {
							width : 90,
							height : 15 }) + "</td></tr>";
					}

					return html + "</table>";
				}

			}
		];
};

QueueGrid.prototype.load = function(data) {
	
	if (data != null) {
		this.key = {};
		this.store.loadData(data, true);
	} else {
		this.store.load();
	}
};

QueueGrid.prototype.getPanel = function() {
	var _this = this;
	if(!Ext.ClassManager.isCreated('Queue') ){
		Ext.define('Queue', {
		extend : 'Ext.data.Model',
		fields : [ 'name', 'date', 'volumePorod', 'runCreationDate', 'measurementCode', 'macromoleculeAcronym', 'bufferAcronym', 'I0',
				'I0Stdev', 'acronym', 'averageFilePath', 'bufferAverageFilePath', 'bufferId', 'bufferOnedimensionalFiles', 'code',
				'comments', 'composition', 'concentration', 'creationDate', 'creationTime', 'dataAcquisitionFilePath', 'dataCollectionId',
				'discardedFrameNameList', 'dmax', 'experimentId', 'experimentType', 'exposureTemperature', 'extintionCoefficient',
				'extraFlowTime', 'firstPointUsed', 'flow', 'frameListId', 'framesCount', 'framesMerge', 'gnomFilePath',
				'gnomFilePathOutput', 'guinierFilePath', 'isagregated', 'kratkyFilePath', 'lastPointUsed', {
					name : 'macromoleculeId',
					id : 'macromoleculeId'

				}, {
					name : 'measurementId',
					type : 'int' }, 'mergeId', 'molecularMass', 'name', 'pH', 'priorityLevelId', 'proposalId', 'quality', 'rg', 'rgGnom',
				'rgGuinier', 'rgStdev', 'runId', 'safetyLevelId', 'sampleAverageFilePath', 'sampleOneDimensionalFiles',
				'samplePlatePositionId', 'scatteringFilePath', 'sequence', 'sessionId', 'sourceFilePath', 'specimenId', 'status',
				'stockSolutionId', 'substractedFilePath', 'subtractionId', 'total', 'transmission', 'viscosity', 'volume', 'volumeToLoad',
				'waitTime', 'reference', 'refined', 'fitCount', 'superposisitionCount', 'rigidbodyCount', 'abinitioCount' ] });	
	}
	

	this.store = Ext.create('Ext.data.Store', {
		model : 'Queue',
		data : [],
		filters : this.filters,
		listeners : {
			beforeload : function() {
				_this.key = {};
				return true;
			},
			load : function(store, records) {

			} },
		proxy : {
			type : 'memory',
			reader : {
				type : 'json' } } });

	var selModel = Ext.create('Ext.selection.RowModel', {
		allowDeselect		: true,
		mode				: this.selectionMode,
		listeners			: {
						        selectionchange: function (sm, selections) {
						           	_this.selected = _this.getSelectedData();
						        	_this.onSelectionChange.notify(_this.selected );
						        },
						        select: function (sm, selected) {
						        	_this.onSelect.notify(selected.data);
						        },
						        deselect: function (sm, deselected) {
						        	_this.onDeselect.notify(deselected.data);
						        }
		}
	});
	
	this.panel = Ext.create('Ext.grid.Panel', {
		title : this.title,
		border : true,
		cls : 'defaultGridPanel',
		maxHeight : this.maxHeight,
//		minHeight : 300,
		overflow : 'auto', 
		margin : 5,
		store : this.store,
		columns : this.getColumns(),
		allowDeselect : true,
		selModel			: selModel,
		collapsible : this.collapsible,
		collapsed : this.collapsed,
		viewConfig : {
			enableTextSelection : true,
			preserveScrollOnRefresh : true,
			stripeRows : true,
			rowLines : true,
			listeners : {
				cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
						if (e.target.defaultValue == 'Data Reduction') {
							location.hash = "/saxs/datacollection/dataCollectionId/" + record.data.dataCollectionId + "/primaryviewer";
						}

						if (e.target.defaultValue == 'Abinitio') {
							_this.onAbinitioButtonClicked(record.raw);
						}

						if (e.target.defaultValue == 'Fit') {
							_this.onFitButtonClicked(record.raw);
						}

						if (e.target.defaultValue == 'Superposition') {
							_this.onSuperpositionButtonClicked(record.raw);
						}

						if (e.target.defaultValue == 'Rigid Body') {
							_this.onRigidBodyButtonClicked(record.raw);
						}
				}
			}
		}
	});
	return this.panel;
};

QueueGrid.prototype.onDataReductionButtonClicked = function(record) {
	var adapter = new DataAdapter();
	var dataReductionForm = new DataReductionForm({});

	Ext.create('Ext.window.Window', {
		title : 'Data Reduction',
		height : 540,
		width : 1000,
		modal : true,
		items : [ dataReductionForm.getPanel() ]
	}).show();

	dataReductionForm.panel.setLoading();
	adapter.onSuccess.attach(function(sender, subtractions) {
		dataReductionForm.refresh(subtractions);
		dataReductionForm.panel.setLoading(false);
	});
	adapter.getSubtractionsBySubtractionIdList([ record.subtractionId ]);
};

