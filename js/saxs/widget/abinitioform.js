/**
 * Example form
 * 
 * @witdh
 * @height
 */
function AbinitioForm(args) {
	this.id = BUI.id();
	this.width = null;
	this.height = null;

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}

	var _this = this;
	this.radius = 3;

	this.PDBViewer = new PDBViewer({
		width: 300,
		height: 300,
		title: "test"
	});
	this.dataCollectionPDBWidget = new DataCollectionPDBWidget({ height: 300, width: 800 });
}


AbinitioForm.prototype.doTemplate = function (data) {
	var html = "";
	/** NSD image URL */
	var NsdURL = null;
	var Chi2RgURL = null;
	if (this.subtractions) {
		if (this.subtractions.length > 0) {
			var subtractionId = this.subtractions[0].subtractionId;
			try {
				var modelListId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.modelList3VO.modelListId;
				NsdURL = EXI.getDataAdapter().saxs.model.getNSDURLbyModelListId(subtractionId, modelListId);
				Chi2RgURL = EXI.getDataAdapter().saxs.model.getChi2RgURLbyModelListId(subtractionId, modelListId);
			}
			catch (e) {
				console.log("No modelListId found");
			}
		}

	}
	/** Id that will be the identifier of the DIV container */
	dust.render("abinitiogrid.template", { NsdURL: NsdURL, Chi2RgURL: Chi2RgURL, id: this.id, models: data }, function (err, out) {
		html = html + out;
	});
	return html;
};

AbinitioForm.prototype.refresh = function (subtractions) {
	this.subtractions = subtractions;
	$('#' + this.id).html(this.doTemplate(this._prepareData(subtractions)));
};

AbinitioForm.prototype._prepareData = function (subtractions) {
	/** Parsing data * */
	var models = [];
	for (var l = 0; l < subtractions.length; l++) {
		var subtraction = subtractions[l];
		for (var k = 0; k < subtraction.substractionToAbInitioModel3VOs.length; k++) {
			var data = subtraction.substractionToAbInitioModel3VOs[k].abinitiomodel3VO;
			var model = null;
			if (data.averagedModel != null) {
				models.push(data.averagedModel);
				models[models.length - 1].type = "Reference";
				models[models.length - 1].pdbURL = EXI.getDataAdapter().saxs.model.getPDBByModelId(subtraction.subtractionId, data.averagedModel.modelId);
				models[models.length - 1].firURL = EXI.getDataAdapter().saxs.model.getFirByModelId(subtraction.subtractionId, data.averagedModel.modelId);
				models[models.length - 1].logURL = EXI.getDataAdapter().saxs.model.getLogByModelId(subtraction.subtractionId, data.averagedModel.modelId);

			}

			if (data.shapeDeterminationModel != null) {
				models.push(data.shapeDeterminationModel);
				models[models.length - 1].type = "Refined";
				models[models.length - 1].pdbURL = EXI.getDataAdapter().saxs.model.getPDBByModelId(subtraction.subtractionId, data.shapeDeterminationModel.modelId);
				models[models.length - 1].firURL = EXI.getDataAdapter().saxs.model.getFirByModelId(subtraction.subtractionId, data.shapeDeterminationModel.modelId);
				models[models.length - 1].logURL = EXI.getDataAdapter().saxs.model.getLogByModelId(subtraction.subtractionId, data.shapeDeterminationModel.modelId);

			}

			if (data.modelList3VO != null) {
				if (data.modelList3VO.modeltolist3VOs != null) {
					for (var i = 0; i < data.modelList3VO.modeltolist3VOs.length; i++) {
						models.push(data.modelList3VO.modeltolist3VOs[i].model3VO);
						models[models.length - 1].type = "Model";
						models[models.length - 1].pdbURL = EXI.getDataAdapter().saxs.model.getPDBByModelId(subtraction.subtractionId, data.modelList3VO.modeltolist3VOs[i].model3VO.modelId);
						models[models.length - 1].firURL = EXI.getDataAdapter().saxs.model.getFirByModelId(subtraction.subtractionId, data.modelList3VO.modeltolist3VOs[i].model3VO.modelId);
						models[models.length - 1].logURL = EXI.getDataAdapter().saxs.model.getLogByModelId(subtraction.subtractionId, data.modelList3VO.modeltolist3VOs[i].model3VO.modelId);
					}
				}
			}
		}
	}
	return models;
};


AbinitioForm.prototype.getDamaverModel = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.averagedModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.averagedModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "AVERAGED",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[0],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};

	}
	catch (e) {
		console.log(e);
	}
};

AbinitioForm.prototype.getDamfiltModel = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.rapidShapeDeterminationModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.rapidShapeDeterminationModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "RAPIDSHAPEDETERMINATIONMODEL",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[1],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};
	}

	catch (e) {
		console.log(e);
	}
};

AbinitioForm.prototype.getDammin = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "SHAPEDETERMINATIONMODEL",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[2],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};
	}

	catch (e) {
		console.log(e);
	}

};



AbinitioForm.prototype.getColors = function () {
	var colors = [];
	colors.push("0xFF6600");
	colors.push("0x00CC00");
	colors.push("0x0099FF");
	return colors;
};

AbinitioForm.prototype.getModels = function (subtractions) {
	var models = [];
	var data = this.data;
	if (this.damaverEnabled) {
		models.push(this.getDamaverModel());
	}

	if (this.damfiltEnabled) {
		models.push(this.getDamfiltModel());
	}

	if (this.damminEnabled) {
		models.push(this.getDammin());
	}

	if (true) {
		/** If no models we merge all **/
		var colorsMerged = [];
		var modelsId = [];
		var title = "Merged [";
		var modelsMerged = [];
		if (models.length == 0) {
			var damaverModel = this.getDamaverModel();
			if (damaverModel != null) {
				damaverModel.opacity = 0.2;
				modelsMerged.push(damaverModel);
			}

			var damfiltModel = this.getDamfiltModel();
			if (damfiltModel != null) {
				damfiltModel.opacity = 0.6;
				modelsMerged.push(damfiltModel);
			}

			var damminModel = this.getDammin();
			if (damminModel != null) {
				damminModel.opacity = 0.8;
				modelsMerged.push(damminModel);
			}
			modelsMerged = [modelsMerged];
		} else {
			modelsMerged = models;
			modelsMerged.push(JSON.parse(JSON.stringify(modelsMerged)));
		}

		return modelsMerged;
	}
	return models;

};

AbinitioForm.prototype.getPanel = function () {
	var _this = this;

	this.panel = Ext.create('Ext.panel.Panel', {
		layout: {
			type: 'fit'
		},
		border: 1,
		margin: '5 0 0 0',
		width: '900',
		items: [
			{
				html: this.doTemplate([]),
				autoScroll: true,
				border: 1,
				padding: 0,
				height: this.height
			},
		],
		listeners: {
			afterrender: function () {
			}
		},
	});


	return this.panel;

};

AbinitioForm.prototype.loadFitPlot = function (subtractions) {
	var _this = this;
	/** For fir files **/
	var onSuccess = function (sender, data) {

		var splitted = data.toString().split("\n");
		var array = [];
		for (var i = 0; i < splitted.length; i++) {
			var line = splitted[i].trim();
			var line_splited = line.split(/\s*[\s,]\s*/);
			if (line_splited.length == 3) {
				array.push([Number(line_splited[0]), BUI.getStvArray(line_splited[1], 0), BUI.getStvArray(line_splited[2], 0)]);
			}
		}
		var dygraphWidget = new StdDevDyGraph(_this.id + "fit", {
			width: 400,
			height: 250,
			xlabel: 'q(nm<sup>-1</sup>)'
		});
		dygraphWidget.draw(array, ["#FF0000", "#0000FF"], ["s", "I(exp)", "I(sim)"]);
	};

	try {
		var shapeDeterminationModelId = _this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
		EXI.getDataAdapter({ onSuccess: onSuccess }).saxs.model.getFitContentByModelId(_this.subtractions[0].subtractionId, shapeDeterminationModelId);
	} catch (e) {
		console.log("shapeDeterminationModelId not found");
	}
};


AbinitioForm.prototype.loadFirPlot = function (subtractions) {
	var _this = this;
	/** For fir files **/
	var onSuccess = function (sender, data) {
		var splitted = data.toString().split("\n");
		var array = [];
		for (var i = 0; i < splitted.length; i++) {
			var line = splitted[i].trim();
			var line_splited = line.split(/\s*[\s,]\s*/);
			if (line_splited.length == 4) {
				array.push([Number(line_splited[0]), BUI.getStvArray(line_splited[1], line_splited[2]), BUI.getStvArray(line_splited[3], 0)]);
			}
		}

		var dygraphWidget = new StdDevDyGraph(_this.id + "fir", {
			width: 400,
			height: 250,
			xlabel: 'q(nm<sup>-1</sup>)'
		});
		dygraphWidget.draw(array, ["#FF0000", "#0000FF", "#FF00FF"], ['s', 'I(exp)', 'I(sim)']);
	};

	try {
		var shapeDeterminationModelId = _this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
		EXI.getDataAdapter({ onSuccess: onSuccess }).saxs.model.getFirContentByModelId(_this.subtractions[0].subtractionId, shapeDeterminationModelId);
	} catch (e) {
		console.log("shapeDeterminationModelId not found");
	}
};

AbinitioForm.prototype.getTextAreaId = function() {
	return this.id + "_pdb_src";
};

/** It populates the form * */
AbinitioForm.prototype.load = function (subtractions) {
	this.subtractions = subtractions;
	//this.panel.insert(0,this.dataCollectionPDBWidget.getPanel(this.subtractions),1);
	this.refresh(subtractions);
	this.loadFitPlot(subtractions);
	this.loadFirPlot(subtractions);

	
	var models = this.getModels(subtractions);
	
	var _this = this;	
	if (BUI.isWebGLEnabled()) {
		this.models = models;

		_this.panel.setLoading("Rendering");
		var onSuccess = function(sender, data){															
			if (data.models != null){
				var XYZ = "";
				for(var i=0; i< data.models.length; i++){
					var XYZ = XYZ + data.models[i].XYZ;					
				}
				document.getElementById(_this.getTextAreaId()).innerHTML = XYZ;
				if (data.models[0] != null){				
					if (_this.glMol == null) {						
						_this.glMol = new GLmol(_this.id + "_pdb");
					} else {						
						_this.glMol.loadMolecule();
					}
				}
			}
			_this.panel.setLoading(false);
		};		
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.model.getPDB(models[0], []);						
	} else {
		this.webGLNotAvailable();
	}

};


/**
 * 
 * @width
 * @height
 * 
 */
function DataCollectionPDBWidget(args) {
	this.id = BUI.id();

	this.width = 900;
	this.height = 600;
	this.title = "";

	this.mergedEnabled = true;
	this.damminEnabled = false;
	this.damaverEnabled = false;
	this.damfiltEnabled = false;

	this.radius = 3;

	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height - 100;
		}
	}
}

DataCollectionPDBWidget.prototype.getPDBViewerPanel = function (model, width, height) {
	return new PDBViewer({
		width: width,
		height: height,
		title: model.title

	}).draw(model);
};


DataCollectionPDBWidget.prototype.getContainers = function (models) {

	var items = [];
	if (models.length < 4) {
		for (key in models) {
			var model = models[key];
			if (model.length == null) {
				model = [model];
			}

			items.push({
				xtype: 'container',
				type: 'vbox',
				margin: '2',
				items: [this.getPDBViewerPanel(model, this.width / models.length, this.height)]

			});
		}
	}

	if (models.length == 4) {
		/** First row **/
		return this.get2x2(models);
	}

	return items;

};

DataCollectionPDBWidget.prototype.getColors = function () {
	var colors = [];
	colors.push("0xFF6600");
	colors.push("0x00CC00");
	colors.push("0x0099FF");
	return colors;
};

DataCollectionPDBWidget.prototype.getPDBPanel = function (items) {
	var panel = Ext.create('Ext.panel.Panel', {
		layout: {
			type: 'hbox'
		},
		border: 1,
		margin: '5 0 0 0',

		items: this.getContainers(items)
	});


	return panel;
};

/** type is fir or fit **/
DataCollectionPDBWidget.prototype._getFirHTML = function (modelId, width, height, type, desc) {

	var html = "<table>";
	html = html + '<tr style="text-align: center;"><td><a style="color:blue;font-weight:bold;" target="_blank" href="' + BUI.getModelFile("FIT", modelId, "txt") + '" >dammin.' + type + '</a></td></tr>';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td>' + desc + '</td></tr>';
	html = html + '<tr><td><div background-color="red" id="' + (this.id + type + modelId) + '" width="' + width + '" height="' + height + '"></div></td></tr>';
	html = html + '</table>';
	console.log(html);
	return html;
};

DataCollectionPDBWidget.prototype.getNSDPlot = function (width, height) {
	var html = "<table>";
	html = html + '<tr><td><div background-color="red"  width="' + width + '" height="' + height + '"></div></td></tr>';
	var url = null;
	if (this.data) {
		url = BUI.getNSDImageURL(this.data.modelListId);
	}
	var action = 'window.open("' + url + '")';
	var img = '<img style="width:' + width + 'px;height:' + height + 'px;"   src="' + url + '">';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td><a href=' + url + ' style="color:blue;font-weight:bold;" target="_blank">NSD file</a></td></tr>';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td>Normalized squared displacement comparison</td></tr>';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td> ' + img + '</td></tr>';
	html = html + '</table>';
	return html;
};

DataCollectionPDBWidget.prototype.getCHI2Plot = function (width, height) {
	var html = "<table>";
	html = html + '<tr><td><div background-color="red"  width="' + width + '" height="' + height + '"></div></td></tr>';
	var url = null;
	if (this.data) {
		url = BUI.getCHI2ImageURL(this.data.modelListId);
	}
	var img = '<img style="width:' + width + 'px;height:' + height + 'px;"   src="' + url + '">';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td><a href=' + url + ' style="color:blue;font-weight:bold;" target="_blank">CHI2 file</a></td></tr>';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td>CHI  comparison</td></tr>';
	html = html + '<tr style="text-align: center;font-style:italic;color:gray;"><td> ' + img + '</td></tr>';
	html = html + '</table>';
	return html;
};

DataCollectionPDBWidget.prototype.getImagesPanel = function () {
	var _this = this;
	var shapeDeterminationModelId = null;
	if (_this.data) {
		shapeDeterminationModelId = _this.data.shapeDeterminationModelId;
	}

	return {
		xtype: 'container',
		layout: 'hbox',
		width: this.width,
		height: 300,
		border: 1,
		margin: '5 0 0 0',
		items: [{
			html: _this._getFirHTML(shapeDeterminationModelId, (this.width / 4) - 5, 250, "fir", "Fit of the simulated scattering curve versus a smoothed experimental data (spline interpolation)"),
			width: (this.width / 4) - 5,
			height: 300,
			border: 1,
			margin: '0 5 0 0'
		}, {
			html: _this._getFirHTML(shapeDeterminationModelId, (this.width / 4) - 5, 250, "fit", "Fit of the simulated scattering curve versus the experimental data."),
			width: (this.width / 4) - 5,
			height: 300,
			border: 1,
			margin: '0 5 0 0'
		}, {
			html: _this.getCHI2Plot(this.width / 4, 250),
			width: (this.width / 4) - 5,
			height: 300,
			border: 1,
			margin: '0 5 0 0'
		}, {
			html: _this.getNSDPlot(this.width / 4, 250),
			width: (this.width / 4) - 5,
			height: 300,
			border: 1
		}

		]
	};
};
DataCollectionPDBWidget.prototype.getPanel = function (data, targetId) {

	this.data = data;
	this.subtractions = data;
	var _this = this;

	this.panelPDB = this.getPDBPanel(this.getModels());
	this.panel = Ext.create('Ext.container.Container', {
		layout: {
			type: 'vbox'
		},
		width: this.width,
		//renderTo : targetId,
		listeners: {
			afterrender: function () {
				/** For fir files **/
				var onSuccess = function (sender, data) {

					var splitted = data.toString().split("\n");
					var array = [];
					for (var i = 0; i < splitted.length; i++) {
						var line = splitted[i].trim();
						var line_splited = line.split(/\s*[\s,]\s*/);
						if (line_splited.length == 3) {
							array.push([Number(line_splited[0]), BUI.getStvArray(line_splited[1], 0), BUI.getStvArray(line_splited[2], 0)]);
						}
					}
					var dygraphWidget = new StdDevDyGraph(_this.id + "fit" + _this.data.shapeDeterminationModelId, {
						width: 400,
						height: 250,
						xlabel: 'q(nm<sup>-1</sup>)'
					});
					dygraphWidget.draw(array, ["#FF0000", "#0000FF"], ["s", "I(exp)", "I(sim)"]);
				};

				try {
					var shapeDeterminationModelId = _this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
					EXI.getDataAdapter({ onSuccess: onSuccess }).saxs.model.getFitContentByModelId(_this.subtractions[0].subtractionId, shapeDeterminationModelId);
				} catch (e) {
					console.log("shapeDeterminationModelId not found");
				}

				/** For fit files **/
				var onSuccessFit = function (sender, data) {
					var splitted = data.toString().split("\n");
					var array = [];
					for (var i = 0; i < splitted.length; i++) {
						var line = splitted[i].trim();
						var line_splited = line.split(/\s*[\s,]\s*/);
						if (line_splited.length == 4) {
							array.push([Number(line_splited[0]), BUI.getStvArray(line_splited[1], line_splited[2]), BUI.getStvArray(line_splited[3], 0)]);
						}
					}

					var dygraphWidget = new StdDevDyGraph(_this.id + "fir" + _this.data.shapeDeterminationModelId, {
						width: 400,
						height: 250,
						xlabel: 'q(nm<sup>-1</sup>)'
					});
					dygraphWidget.draw(array, ["#FF0000", "#0000FF", "#FF00FF"], ['s', 'I(exp)', 'I(sim)']);
				};
				try {
					var shapeDeterminationModelId = _this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
					EXI.getDataAdapter({ onSuccess: onSuccessFit }).saxs.model.getFirContentByModelId(_this.subtractions[0].subtractionId, shapeDeterminationModelId);
				} catch (e) {
					console.log("shapeDeterminationModelId not found");
				}
			}
		},
		items: [this.panelPDB, this.getImagesPanel()]
	});
	return this.panel;

};

DataCollectionPDBWidget.prototype.getDamaverModel = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.averagedModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.averagedModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "AVERAGED",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[0],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};

	}
	catch (e) {
		console.log(e);
	}
};

DataCollectionPDBWidget.prototype.getDamfiltModel = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.rapidShapeDeterminationModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.rapidShapeDeterminationModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "RAPIDSHAPEDETERMINATIONMODEL",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[1],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};
	}

	catch (e) {
		console.log(e);
	}
};

DataCollectionPDBWidget.prototype.getDammin = function () {
	try {
		var modelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.modelId;
		var abInitioModelId = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.abInitioModelId;
		var title = this.subtractions[0].substractionToAbInitioModel3VOs[0].abinitiomodel3VO.shapeDeterminationModel.pdbFile;
		title = title.split("/")[title.split("/").length - 1];
		return {
			type: "SHAPEDETERMINATIONMODEL",
			modelId: modelId,
			abInitioModelId: abInitioModelId,
			color: this.getColors()[2],
			title: title,
			opacity: 0.5,
			radius: this.radius
		};
	}

	catch (e) {
		console.log(e);
	}

};

DataCollectionPDBWidget.prototype.refresh = function (models) {
	this.panel.remove(this.panelPDB);
	this.panelPDB = this.getPDBPanel(models);
	this.panel.insert(this.panelPDB, 0);
};

DataCollectionPDBWidget.prototype.getModels = function () {
	var models = [];
	var data = this.data;
	if (this.damaverEnabled) {
		models.push(this.getDamaverModel());
	}

	if (this.damfiltEnabled) {
		models.push(this.getDamfiltModel());
	}

	if (this.damminEnabled) {
		models.push(this.getDammin());
	}

	if (this.mergedEnabled) {
		/** If no models we merge all **/
		var colorsMerged = [];
		var modelsId = [];
		var title = "Merged [";
		var modelsMerged = [];
		if (models.length == 0) {
			var damaverModel = this.getDamaverModel();
			if (damaverModel != null) {
				damaverModel.opacity = 0.2;
				modelsMerged.push(damaverModel);
			}

			var damfiltModel = this.getDamfiltModel();
			if (damfiltModel != null) {
				damfiltModel.opacity = 0.6;
				modelsMerged.push(damfiltModel);
			}

			var damminModel = this.getDammin();
			if (damminModel != null) {
				damminModel.opacity = 0.8;
				modelsMerged.push(damminModel);
			}
			modelsMerged = [modelsMerged];
		} else {
			modelsMerged = models;
			modelsMerged.push(JSON.parse(JSON.stringify(modelsMerged)));
		}

		return modelsMerged;
	}
	return models;
};
