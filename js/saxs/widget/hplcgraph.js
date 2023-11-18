
function HPLCGraph(args) {
	this.width = 600;
	this.height = 600;
	this.title = '';
	this.bbar = false;
	this.plotInnerPanelPadding = 10;
	this.plotPanelPadding = 10;
	this.id = BUI.id();

	this.hidePlots = null;
	this.xlabel = "";
	this.scaled = false;
	this.xParam = null;
	this.showRangeSelector = true;
	this.interactionModel = null;

	/** for each stat the max and minimum value when it is scaled in order to show correctly in the legend **/
	this.ranges = {};
	if (args != null) {
		if (args.interactionModel != null) {
			this.interactionModel = args.interactionModel;
		}		
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.bbar != null) {
			this.bbar = args.bbar;
		}
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.plots != null) {
			this.plots = args.plots;
		}

		if (args.scaled != null) {
			this.scaled = args.scaled;
		}
		if (args.xlabel != null) {
			this.xlabel = args.xlabel;
		}
		if (args.xParam != null) {
			this.xParam = args.xParam;
		}
		if (args.showRangeSelector != null) {
			this.showRangeSelector = args.showRangeSelector;
		}
	}

	this.onZoomX = new Event(this);
	this.onResetZoom = new Event(this);
	this.dblclick = new Event(this);
	this.onClearSelection = new Event(this);
}

HPLCGraph.prototype.getMenu = function() {
	var _this = this;
	/** Actions buttons **/
	var actions = [];

	function toggle(item, pressed) {
		if (pressed) {
			_this.plots[item.param] = true;
		} else {
			delete _this.plots[item.param];
		}
		_this.reloadData(this.hplcData);
	}

	for (var i = 0; i < this.hplcData.length; i++) {
		if (this.hplcData[i].showOnMenu != false) {
			var param = this.hplcData[i].param;
			var style = "style='padding:0 0px 0 5px;'";
			actions.push({
				text : "<table><tr><td>" + BUI.getRectangleColorDIV(this.hplcData[i].color, 10, 10) + "</td><td " + style + "> "
						+ this.hplcData[i].label + "</td></tr></table>",
				id : _this.id + param,
				param : param,
				enableToggle : true,
				scope : this,
				toggleHandler : toggle,
				pressed : (_this.plots[param] != null) });
		}
	}
	actions.push("-");

	actions.push({
		text : "Scale",
		enableToggle : true,
		scope : this,
		pressed : this.scaled,
		icon : '../images/icon_graph.png',
		toggleHandler : function(item, pressed) {
			_this.scaled = pressed;
			_this.reloadData(this.hplcData);
		} });

	actions.push("->");
	/** Dygraph.export is needed */
	/*actions.push({
		text : "Save",
		disabled : true,
		scope : this,
		icon : 'images/icon/ic_get_app_black_24dp.png',
		handler : function(item, pressed) {
			debugger
			var largeImage = document.createElement("img");
			largeImage.style.display = 'block';
			largeImage.style.width = 200 + "px";
			largeImage.style.height = 200 + "px";
			largeImage.setAttribute('src', Dygraph.Export.asCanvas(this.dygraphObject.dygraph).toDataURL());
			window.open(Dygraph.Export.asCanvas(this.dygraphObject.dygraph).toDataURL(), 'Image', '');
		} });
	*/
	return actions;
};

/** Looks for the maximum value and then divide everything but that value **/
HPLCGraph.prototype.scaledData = function(data) {
	for (var i = 0; i < data.length; i++) {
		var values = this.getMaxAndMinValue(data[i]);
		data[i] = this.divideValuesByMax(data[i], values.max);
		this.ranges[data[i].label] = values;
	}
	return data;
};

/** Given a stat float[] and a max number it will divide each value by max **/
HPLCGraph.prototype.divideValuesByMax = function(stat, max) {
	for (var j = 0; j < stat.data.length; j++) {
		if (max != 0) {
			stat.data[j] = Number(stat.data[j]) / max;
			stat.std[j] = Number(stat.std[j]) / max;
		}
	}
	return stat;
};

/** returns max value of a stat **/
HPLCGraph.prototype.getMaxAndMinValue = function(stat) {
	var max = 0;
	var min = stat.data[0];
	for (var j = 0; j < stat.data.length; j++) {
		if (Number(stat.data[j]) > max) {
			max = Number(stat.data[j]);
		}
		if (Number(stat.std[j]) > max) {
			max = Number(stat.std[j]);
		}
		if (Number(stat.data[j]) < min) {
			min = Number(stat.data[j]);
		}
	}
	return {
		max : Number(max),
		min : Number(min) };
};

HPLCGraph.prototype.getPoint = function(data, i) {
	var point = [ 10, 10, 10 ];
	var y = parseFloat(data.data[i]);
	var error = parseFloat(data.std[i]);
	if (data.fdata == null) {
		return [ y - error, y, y + error ];
	} else {
		if (data.fstd != null) {
			return [ data.fstd(y - error), data.fdata(y), data.fstd(y + error) ];
		}
		return [ data.fdata(y) - error, data.fdata(y), data.fdata(y) + error ];
	}	
};

HPLCGraph.prototype.reloadData = function(hplcData) {
	this.panel.setLoading(false);
	this.hplcData = hplcData;

	var data = hplcData;


	if (this.scaled) {
		data = this.scaledData(JSON.parse(JSON.stringify(hplcData)));
	}
	var paramIndex = {};
	var parsed = [];
	var j = 0;
	for (var i = 0; i < data[0].data.length - 1; i++) {
		var aux = [];
		for (j = 0; j < data.length; j++) {
			if (this.plots != null) {
				if (this.plots[data[j].param] != null) {
					aux.push(this.getPoint(data[j], i));
					paramIndex[data[j].param] = aux.length - 1;
				}
			} else {
				aux.push([ data[j].data[i] - data[j].std[i], data[j].data[i], data[j].data[i] + data[j].std[i] ]);
			}
		}
		parsed.push([]);

		var index = i;
		if (this.xParam != null) {
			index = parseFloat(data[this.xParam].data[i]);
		}

		parsed[parsed.length - 1].push(index);

		for (j = 0; j < data.length; j++) {
			if (this.plots != null) {
				if (this.plots[data[j].param] != null) {
					parsed[parsed.length - 1].push(aux[paramIndex[data[j].param]]);
				}
			} else {
				parsed[parsed.length - 1].push(aux[j]);
			}
		}
	}

	var colors = [];
	var labels = [ "" ];
	for (j = 0; j < data.length; j++) {
		if (this.plots != null) {
			if (this.plots[data[j].param] != null) {
				colors.push(data[j].color);
				labels.push(data[j].label);
			}
		} else {
			parsed[parsed.length - 1].push(aux[j]);
		}
	}

	this._renderDygraph(parsed, colors, labels);
};

HPLCGraph.prototype._renderDygraph = function(parsed, colors, labels) {
	var _this = this;
	Ext.getCmp(this.id).setWidth(this.panel.getWidth());
	this.dygraphObject = new StdDevDyGraph(this.id, {
		width : this.panel.getWidth() - 20,
		height : this.height - 10,
		xlabel : this.xlabel,
		showRangeSelector : this.showRangeSelector,
		interactionModel : this.interactionModel,
		scaled : this.scaled
//		ranges : this.ranges 
	});
	this.dygraphObject.draw(parsed, colors, labels);

	var _this = this;
	this.dygraphObject.onZoomX.attach(function(sender, args) {
		try {
			_this.onZoomX.notify(args);
		} catch (e) {}
	});

	this.dygraphObject.onResetZoom.attach(function(sender, args) {
		try {
			_this.onResetZoom.notify(args);
		} catch (e) {}
	});

	this.dygraphObject.dblclick.attach(function(sender, args) {
		try {
			_this.dblclick.notify(args);
		} catch (e) {}
	});

};

HPLCGraph.prototype.loadData = function(data,experimentId) {
	var _this = this;
    this.experimentId = experimentId;
	this.reloadData(data);
	this.panel.addDocked({
		cls : 'hplcMenu',
		xtype : 'toolbar',
		items : this.getMenu() });

	if (this.bbar == true) {
		this.panel.addDocked({
			border : 1,
			xtype : 'toolbar',
			dock : 'bottom',
			cls : 'hplcMenu',
			items : [ {
				xtype : 'numberfield',
				id : 'main_field_start',
				fieldLabel : 'Range from',
				width : 200,
				labelWidth :60,
				value : 0,
				minValue : 0 }, {
				xtype : 'numberfield',
				id : 'main_field_end',
				fieldLabel : 'to',
				width : 140,
				labelWidth : 20,
				value : 0,
				minValue : 0 }, {
				xtype : 'button',
				text : 'Go',
				handler : function() {
					var start = parseFloat(Ext.getCmp("main_field_start").getValue());
					var end = parseFloat(Ext.getCmp("main_field_end").getValue());

					if (start < 0) {
						start = 0;
					}
					if (end < 0) {
						end = 0;
					}
					if (start > end) {
						var aux = end;
						end = start;
						start = aux;
					}

					_this.dygraphObject.dygraph.updateOptions({
						isZoomedIgnoreProgrammaticZoom : true,
						dateWindow : [ start, end ] });
				} },
                {
				xtype : 'button',
				text : 'Download Range',
                icon : '../images/icon/ic_get_app_black_24dp.png',
				handler : function() {
					var start = parseFloat(Ext.getCmp("main_field_start").getValue());
					var end = parseFloat(Ext.getCmp("main_field_end").getValue());

					if (start < 0) {
						start = 0;
					}
					if (end < 0) {
						end = 0;
					}
					if (start > end) {
						var aux = end;
						end = start;
						start = aux;
					}

					location.href = EXI.getDataAdapter().saxs.hplc.getDownloadHDF5FramesURL(_this.experimentId,start, end)
				} },
				"->",
				 {
					xtype : 'button',
					text : 'Clear Selection',
					handler : function() {
						_this.onClearSelection.notify();
					} }
					] });
	}
};

HPLCGraph.prototype.getPanel = function() {
	var _this = this;
	this.panel = Ext.create('Ext.panel.Panel', {
		margin : this.plotPanelPadding, 
        flex : 1,       		
		items : [ {
			html : "",
			id : this.id,			
			height : this.height } ] });

	this.panel.on("afterrender", function(panel) {
		document.getElementById(this.id).setAttribute("style",
				"border: 1px solid #000000; height:" + (panel.getHeight() - 1) + "px;width:" + (panel.getWidth() - 50) + "px;");

	});

	return this.panel;
};



HPLCGraph.prototype.getDataByFrameNumber = function(frameNumber) {
	var data = {};
	data.frameNumber = frameNumber;
	for ( var key in this.hplcData) {
		data[this.hplcData[key].label] = this.hplcData[key].data[frameNumber];
	}
	return data;
};


function MergesHPLCGraph(args) {
	HPLCGraph.prototype.constructor.call(this, args);

	//	this.peakColors = ["#00FB42", "#00BA31", "#007C21", "#003E10"];
	this.peakColors = [ "#DEBD00", "#6D9100", "#872900", "#0092CC" ];
}

MergesHPLCGraph.prototype.scaledData = HPLCGraph.prototype.scaledData;
MergesHPLCGraph.prototype.divideValuesByMax = HPLCGraph.prototype.divideValuesByMax;
MergesHPLCGraph.prototype.getMaxAndMinValue = HPLCGraph.prototype.getMaxAndMinValue;
MergesHPLCGraph.prototype.getPoint = HPLCGraph.prototype.getPoint;
MergesHPLCGraph.prototype.reloadData = HPLCGraph.prototype.reloadData;
MergesHPLCGraph.prototype._renderDygraph = HPLCGraph.prototype._renderDygraph;
MergesHPLCGraph.prototype.loadData = HPLCGraph.prototype.loadData;
MergesHPLCGraph.prototype.getPanel = HPLCGraph.prototype.getPanel;
MergesHPLCGraph.prototype.getDataByFrameNumber = HPLCGraph.prototype.getDataByFrameNumber;

MergesHPLCGraph.prototype.setPeaks = function(data) {
	this.peaks = data;
	/** get size of peaks **/
	this.peakKeys = [];
	this.colorPeak = {};
	var colorCount = 1;
	for ( var key in this.peaks) {
		if (this.peaks.hasOwnProperty(key)) {
			var color = this.peakColors[colorCount % this.peakColors.length];
			colorCount = colorCount + 1;
			this.peakKeys.push(key);
			this.colorPeak[key] = color;
		}
	}
	this.peakKeys.sort();
};

MergesHPLCGraph.prototype.getMenu = function() {
	var _this = this;
	/** Actions buttons **/
	var actions = [];

	function toggle(item, pressed) {
		if (pressed) {
			_this.plots[item.param] = true;
		} else {
			delete _this.plots[item.param];
		}
		_this.reloadData(_this.hplcData);
	}

	/** Toolbar for peaks  Average **/
	if (this.peaks != null) {
		var items = [];
		for (var i = 0; i < this.peakKeys.length; i++) {
			var color = this.colorPeak[this.peakKeys[i]];
			items.push({
				text : "<span style='color:" + color + "; font-weight:bold;'>Peak #" + i + " "
						+ this.peakKeys[i].replace("- ", " to #").replace(".0", "").replace(".0", "") + "</span>",
				peakid : this.peakKeys[i],
				checked : false,
				checkHandler : function(sender, pressed) {
					var item = new Object();
					item.param = sender.peakid;
					toggle(item, pressed);
				} });
		}

		var menu = Ext.create('Ext.menu.Menu', {
			id : 'mainMenu',

			style : {
				overflow : 'visible' },
			items : items });
		var tb = Ext.create('Ext.toolbar.Toolbar');
		tb.add({
			text : 'Peaks Avg.',
			menu : menu });
		actions.push(tb);
	}

	for (var i = 0; i < this.hplcData.length; i++) {
		if (this.hplcData[i].showOnMenu != false) {
			var param = this.hplcData[i].param;
			var style = "style='padding:0 0px 0 5px;'";
			actions.push({
				text : "<table><tr><td>" + BUI.getRectangleColorDIV(this.hplcData[i].color, 10, 10) + "</td><td " + style + "> "
						+ this.hplcData[i].label + "</td></tr></table>",
				id : _this.id + param,
				param : param,
				enableToggle : true,
				scope : this,
				margin : 5,
				toggleHandler : toggle,
				pressed : (_this.plots[param] != null) });
		}
	}

	actions.push("->");
	actions.push({
		text : "Save",
		scope : this,
		icon : '../images/icon/ic_get_app_black_24dp.png',
		handler : function(item, pressed) {
			var largeImage = document.createElement("img");
			largeImage.style.display = 'block';
			largeImage.style.width = 200 + "px";
			largeImage.style.height = 200 + "px";
			largeImage.setAttribute('src', Dygraph.Export.asCanvas(this.dygraphObject.dygraph).toDataURL());
			window.open(Dygraph.Export.asCanvas(this.dygraphObject.dygraph).toDataURL(), 'Image', '');
		} });

	return actions;
};
