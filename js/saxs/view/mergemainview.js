function MergeMainView() {
	this.title = "Primary Data View";
	this.icon = 'images/icon/ic_blur_on_black_18dp.png';
	this.queueGridList = [];

	var _this = this;

	/** Curve plotter * */
	this.plotter = new CurvePlotter({});
	this.formPopulated = false;
	this.plotter.onRendered.attach(function(sender) {
		/** only once * */
		if (!_this.formPopulated) {
			/** colors * */
			var colors = {};
			for (var i = 1; i < sender.getLabels().length; i++) {
				colors[sender.getLabels()[i]] = sender.getColors()[i - 1];
			}

			_this.populateForm(sender.getPointCount(), colors);
			_this.formPopulated = true;
		}
		plotter = sender;
	});
}

MergeMainView.prototype.getPanel = MainView.prototype.getPanel;
MergeMainView.prototype.getContainer = MainView.prototype.getContainer;

MergeMainView.prototype.populateForm = function(pointCount, colors) {
	for (var i = 0; i < this.frames.length; i++) {
		this.editorPanel.add(this.getCurveContainer(this.frames[i].subtractionId, this.frames[i].fileName, 0, 5, this.frames[i].scale,
				pointCount, colors));
	}
};

MergeMainView.prototype.getSelected = function() {
	var selected = [];
	for (var i = 0; i < this.queueGridList.length; i++) {
		selected = this.queueGridList[i].getSelected().concat(selected);
	}
	return selected;
};

MergeMainView.prototype.getCurveContainer = function(subtractionId, fileName, from, to, scale, pointCount, colors) {
	var _this = this;
	return Ext.create('Ext.Panel', {
		width : 380,
		layout : 'vbox',
		border : 1,
		style : {
			// borderColor : colors[fileName],
			borderStyle : 'solid',
			borderWidth : '1px' },
		margin : '10 0 0 5',
		items : [ {
			xtype : 'container',
			margin : '0 0 0 0',
			layout : 'hbox',
			items : [ {
				xtype : 'container',
				layout : 'vbox',
				items : [ {
					html : '<span style="font-size:12px;color:' + colors[fileName] + ';">' + fileName + '</span>',
					margin : '10 0 0 10' },

				{
					xtype : 'sliderfield',
					margin : '10 0 0 2',
					hideLabel : true,
					width : 275,
					minValue : 0,
					subtractionId : subtractionId,
					id : "slider" + subtractionId,
					maxValue : pointCount,
					increment : 1,
					values : [ 0, pointCount ],
					listeners : {
						changecomplete : function(slider, newValue, thumb, eOpts) {
							var values = slider.getValues();
							for (var i = 0; i < _this.frames.length; i++) {
								if (_this.frames[i].subtractionId == slider.subtractionId) {
									_this.frames[i].from = _this.plotter.dygraph.getValue(values[0] - 1, 0);
									_this.frames[i].to = _this.plotter.dygraph.getValue(values[1] - 1, 0);
								}
							}
							_this.updateCurve();
						} } } ] }, {
				xtype : 'container',
				layout : 'vbox',
				items : [ {
					xtype : 'container',
					layout : 'hbox',
					items : [ {
						xtype : 'button',
						text : '<',
						width : 30,
						margin : '2 0 0 10',
						subtractionId : subtractionId,
						handler : function(sender) {
							var id = "slider" + sender.subtractionId;
							Ext.getCmp(id).setValue(0, Ext.getCmp(id).getValues()[0] - 1);
							var values = Ext.getCmp(id).getValues();
							for (var i = 0; i < _this.frames.length; i++) {
								if (_this.frames[i].subtractionId == sender.subtractionId) {
									_this.frames[i].from = _this.plotter.dygraph.getValue(values[0] - 1, 0);
								}
							}

							_this.updateCurve();
						} }, {
						xtype : 'button',
						text : '>',
						width : 30,
						margin : '2 0 0 5',
						subtractionId : subtractionId,
						handler : function(sender) {
							var id = "slider" + sender.subtractionId;
							Ext.getCmp(id).setValue(1, Ext.getCmp(id).getValues()[1] + 1);
							var values = Ext.getCmp(id).getValues();
							for (var i = 0; i < _this.frames.length; i++) {
								if (_this.frames[i].subtractionId == sender.subtractionId) {
									_this.frames[i].to = _this.plotter.dygraph.getValue(values[1] - 1, 0);
								}
							}
							_this.updateCurve();
						} }

					]

				}, {
					xtype : 'container',
					layout : 'hbox',
					margin : '2 0 2 0',
					items : [ {
						xtype : 'button',
						text : '+',
						margin : '0 0 0 10',
						width : 30,
						subtractionId : subtractionId,
						handler : function(sender) {
							for (var i = 0; i < _this.frames.length; i++) {
								console.log(sender.subtractionId);
								if (_this.frames[i].subtractionId == sender.subtractionId) {
									_this.frames[i].scale = _this.frames[i].scale + 0.1;
								}
							}
							_this.updateCurve();
						} }, {
						xtype : 'button',
						text : '-',
						width : 30,
						margin : '0 0 0 5',
						subtractionId : subtractionId,
						handler : function(sender) {
							for (var i = 0; i < _this.frames.length; i++) {
								if (_this.frames[i].subtractionId == sender.subtractionId) {
									_this.frames[i].scale = _this.frames[i].scale - 0.1;
								}
							}
							_this.updateCurve();
						} } ] } ] }

			] }

		] });
};

MergeMainView.prototype.getSubtractionEditor = function() {
	var _this = this;
	this.editorPanel = Ext.create('Ext.Panel', {
		border : 1,
		height : 600,
		width : 400,
		layout : 'vbox',
		scrollable : true,
		style : {
			borderColor : '#000000',
			borderStyle : 'solid',
			borderWidth : '1px' },
		items : [],
		bbar : [ {
					text : "Download",
					xtype : 'button',
					handler : function(sender) {
						var params = _this.getParams();
						window.open(new DataAdapter().getMergeURL(params.subtractionIds.toString(), params.from.toString(), params.to.toString(), params.scale.toString()));
					}
		}]
//		{
//			xtype : 'button',
//			text : 'Download',
//			margin : '0 0 0 10',
//			width : 30,
//			handler : function(sender) {
//
//			} } ] 
			
	});
	return this.editorPanel;
};

MergeMainView.prototype.getParams = function() {
	var from = [];
	var to = [];
	var scale = [];
	var subtractionIds = [];
	for (var i = 0; i < this.frames.length; i++) {
		var frame = this.frames[i];
		if (frame.from != null) {
			from.push(frame.from);
		} else {
			from.push("");
		}
		if (frame.to != null) {
			to.push(frame.to);
		} else {
			to.push("");
		}
		if (frame.scale != null) {
			scale.push(frame.scale);
		} else {
			scale.push("");
		}
		if (frame.subtractionId != null) {
			subtractionIds.push(frame.subtractionId);
		} else {
			subtractionIds.push("");
		}
	}
	return {
		from : from,
		to : to,
		scale : scale,
		subtractionIds : subtractionIds,
		
	};
};

MergeMainView.prototype.updateCurve = function() {
	

	/** Saving zoom * */
	this.xAxisRange = this.plotter.dygraph.xAxisRange();
	this.yAxisRange = this.plotter.dygraph.yAxisRange();

	var params = this.getParams();
	this.plotter.loadMerge(params.subtractionIds.toString(), params.from.toString(), params.to.toString(), params.scale.toString());
	this.plotter.dygraph.updateOptions({
		dateWindow : this.xAxisRange,
		valueRange : this.yAxisRange });
};

MergeMainView.prototype.getSlavePanel = function() {
	return {
		xtype : 'container',
		layout : 'hbox',
		cls : 'defaultGridPanel',
		border : 0,
		defaults : {
			xtype : 'container',
			height : 600 },
		items : [ this.getSubtractionEditor(), this.plotter.getPanel() ] };
};

MergeMainView.prototype.load = function(selected) {
	var _this = this;

	var grid = new QueueGrid({
		maxHeight : 300

	});

	this.panel.setTitle("Merge Tool");
	this.container.insert(0, grid.getPanel());

	this.container.insert(1, this.getSlavePanel());
	grid.load(selected);
	grid.panel.setLoading(false);

	var dataCollectionIds = [];
	var subtractionIds = [];
	var subtractionKey = [];

	this.frames = [];
	for (var i = 0; i < selected.length; i++) {

		dataCollectionIds.push(selected[i].dataCollectionId);
		if (subtractionKey[selected[i].subtractionId] == null) {
			subtractionIds.push(selected[i].subtractionId);
			this.frames.push({
				'fileName' : selected[i].substractedFilePath.substr(selected[i].substractedFilePath.lastIndexOf("/") + 1),
				'subtractionId' : selected[i].subtractionId,
				'scale' : 1 });

			subtractionKey[selected[i].subtractionId] = true;
		}
	}

	/** Loading the subtraction on the curve Plotter * */
	this.plotter.load({
		subtracted : subtractionIds });

};
