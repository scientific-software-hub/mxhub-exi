
/**
 * Using dygraph it plots a chart. Params: targetId, labelsContainerId, args
 * 
 * @width
 * @height
 * @labelsWidth
 * @targetId
 * @customBars
 * @ylabel
 * @xlabel
 * @showRangeSelector Show or hide the range selector widget.
 */
function DygraphWidget(targetId, args) {
	this.width = 1000;
	this.height = 600;
	this.labelsWidth = 100;
	this.targetId = targetId;
	this.customBars = false;
	this.ylabel = "";
	this.xlabel = "";
	this.id = BUI.id();
	this.showRangeSelector = false;
	this.interactionModel = null;
	this.labelsDivStyles = null;
	this.plotter = null;
	this.ranges = [         ];
	this.strokeWidth = null;
	this.drawPoints = null;
	if (args != null) {
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}

		if (args.labelsWidth != null) {
			this.labelsWidth = args.labelsWidth;
		}
		if (args.labelsDivStyles != null) {
			this.labelsDivStyles = args.labelsDivStyles;
		}
		if (args.customBars != null) {
			this.customBars = args.customBars;
		}
		if (args.ylabel != null) {
			this.ylabel = args.ylabel;
		}
		if (args.xlabel != null) {
			this.xlabel = args.xlabel;
		}
		if (args.showRangeSelector != null) {
			this.showRangeSelector = args.showRangeSelector;
		}
		if (args.interactionModel != null) {
			this.interactionModel = args.interactionModel;
		}

		if (args.scaled != null) {
			this.scaled = args.scaled;
		}
		if (args.ranges != null) {
			this.ranges = args.ranges;
		}
		if (args.plotter != null) {
			this.plotter = args.plotter;
		}
		if (args.strokeWidth != null) {
			this.strokeWidth = args.strokeWidth;
		}
		if (args.drawPoints != null) {
			this.drawPoints = args.drawPoints;
		}

		

	}

	this.onZoomX = new Event(this);
	this.onResetZoom = new Event(this);
	this.dblclick = new Event(this);
}

/** Draws it on targetId 
 * data: dygraphs.com/data.html
 * 
 * **/

DygraphWidget.prototype.dblclick = function(event, g, context) {
	g.widget.dblclick.notify({
		x : g.lastx_ });
};

DygraphWidget.prototype._createHTLMWrapper = function(data, colors, labels) {
	/** If plot is set in a tab it is possible that it is not renderer yet **/
	if (document.getElementById(this.targetId) == null) {
		return;
	}
	document.getElementById(this.targetId).innerHTML = "";
	/** Creating legend in a table **/
	var table = document.createElement("table");
	var tr = document.createElement("tr");
	var tdCanvas = document.createElement("td");

	this.canvasDiv = document.createElement("div");
	this.canvasDiv.setAttribute("id", "dygraph_canvas_" + this.id);
	this.canvasDiv.setAttribute("style", "width:" + this.width + "px;height:" + this.height + "px");
	tdCanvas.appendChild(this.canvasDiv);

	this.legendDiv = document.createElement("div");
	tr.appendChild(tdCanvas);
	table.appendChild(tr);
	document.getElementById(this.targetId).appendChild(table);
};

DygraphWidget.prototype.draw = function(data, colors, labels) {
	var _this = this;
	this._createHTLMWrapper(data, colors, labels);


	 
	
	this.dygraph = new Dygraph(this.canvasDiv, data, {
		labels : labels,
		//labelsDiv : this.legendDiv,
		labelsSeparateLines : true,
		highlightCircleSize : 3,
		strokeWidth : 1,
		 legend: 'always',
		customBars : this.customBars,
		drawPoints: this.drawPoints,
		strokeWidth: this.strokeWidth,
		colors : colors,
	    plotter : this.plotter,
		xlabel : this.xlabel,
		ylabel : this.ylabel,
		showRangeSelector : this.showRangeSelector,
		rangeSelectorPlotStrokeColor : 'rgba(50,50,50,0.3)',
		rangeSelectorPlotFillColor : 'rgba(50,50,50,0.1)',
		labelsDivStyles : this.labelsDivStyles,
		interactionModel : this.interactionModel,
		underlayCallback : function(canvas, area, g) {
			if (_this.ranges != null) {
				for ( var key in _this.ranges) {
					var bottom_left = g.toDomCoords(_this.ranges[key].start, -20);
					var top_right = g.toDomCoords(_this.ranges[key].end, +20);

					var left = bottom_left[0];
					var right = top_right[0];

					canvas.fillStyle = _this.ranges[key].color;
					canvas.fillRect(left, area.y, right - left, area.h);

				}
			}

		} });

};



function StdDevDyGraph(targetId, args) {
	this.scaled = false;
	if (args == null) {
		args = {};
	}
	args.customBars = true;
	DygraphWidget.prototype.constructor.call(this, targetId, args);
}

StdDevDyGraph.prototype.dblclick = DygraphWidget.prototype.dblclick;
StdDevDyGraph.prototype._createHTLMWrapper = DygraphWidget.prototype._createHTLMWrapper;
StdDevDyGraph.prototype.draw = DygraphWidget.prototype.draw;

StdDevDyGraph.prototype.input = function() {
	return {
		data : [ [ 1, [ 2, 3, 3.5 ], [ 4, 4.2, 5 ] ], [ 2, [ 5, 5.5, 5.7 ], [ 4, 4.2, 5 ] ] ],
		colors : [ "blue", "red" ],
		labels : [ "", 'data1', 'data2' ] };
};

StdDevDyGraph.prototype.test = function(targetId) {
	var dygraphObject = new StdDevDyGraph(targetId, {
		width : 500,
		height : 400,
		xlabel : "xLabel",
		showRangeSelector : false });

	dygraphObject.draw(dygraphObject.input().data, dygraphObject.input().colors, dygraphObject.input().labels);
};
