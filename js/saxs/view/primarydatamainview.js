function PrimaryDataMainView() {
	this.title = "Primary Data View";
	this.icon = 'images/icon/ic_blur_on_black_18dp.png';

	MainView.call(this);

	this.onMeasurementSelectionChange = new Event(this);

	var _this = this;
	this.selections = null;

	this.framesGrid = new FramesGrid();
	this.framesGrid.onSelectionChange.attach(function (sender, selections) {
		_this.selections = selections;
		_this.selections.operation = $('input[name=optradio]:checked').val();
		_this.plotter.load(_this.selections);
	});

	/** Curve plotter * */
	this.plotter = new CurvePlotter({
	});

	this.overviewQueueGrid = new OverviewQueueGrid({ height: 220 });
	
}



PrimaryDataMainView.prototype.getPrimaryReductionPanel = function () {
	return {
		xtype: 'container',
		layout: 'hbox',
		cls: 'defaultGridPanel',
		margin: 5,
		border: 0,
		defaults: {
			height: 400
		},
		items: [
			{
				title: '<label class="radio-inline"><input type="radio" value="LOG" name="optradio" checked>Log</label><label class="radio-inline"><input type="radio" value="LINEAL" name="optradio">Lineal</label>',
				xtype: 'panel',
				autoScroll: true,

				flex: 0.2,
				border: 1,
				style: {
					borderColor: '#000000',
					borderStyle: 'solid',
					borderWidth: '1px'
				},
				items: [
					this.framesGrid.getPanel()
				]
			},
			this.plotter.getPanel()
		]
	};
};

PrimaryDataMainView.prototype.getPanel = function () {
	var _this = this;

	this.panel = Ext.create('Ext.panel.Panel', {
		xtype: 'container',
		autoScroll: true,
		layout: 'fit',
		padding: 10,

		items: [
			{
				xtype: 'container',
				items: [
					this.overviewQueueGrid.getPanel(),
					
					{
						xtype: 'tabpanel',
						margin : 20,
						border : 1,
						cls: 'borderGrid',
						  listeners: {
							
							tabchange: function(a,b,c) {
								if (a.activeTab.title == 'Abinitio Modeling'){
									
								
								}

							 }
						},
						items: [{
							title: 'Data Reduction',
							tooltip: 'Automatic Data Reduction',
							items: [
									this.getPrimaryReductionPanel()
							]
						}]
					}					
					
				]
			}
		]
	});

	this.panel.on('boxready', function () {
		$('input:radio[name=optradio]').change(function () {
			if (_this.selections) {
				_this.selections.operation = $('input[name=optradio]:checked').val();
				_this.plotter.load(_this.selections);
			}
		});
	});

	return this.panel;
};

PrimaryDataMainView.prototype.load = function (dataCollectionId) {
	var _this = this;
	this.dataCollectionId = dataCollectionId;

	var onSuccessA = function (sender, dataCollections) {
		_this.overviewQueueGrid.load(dataCollections);

		var onSuccessFrames = function (sender, averages) {
			var allFrames = _.map(_.flatten(_.map(_.map(JSON.parse(averages), 'framelist3VO'), 'frametolist3VOs')), 'frame3VO');
			/** Retrieve subtraction */

			var onSuccessSubtractions = function (sender, data) {
				if (data) {
					if (data[0].substraction3VOs) {
						var subtraction = data[0].substraction3VOs[0];
						if (subtraction.sampleOneDimensionalFiles) {
							var frameFromSampleAveraged = _.map(subtraction.sampleOneDimensionalFiles.frametolist3VOs, 'frame3VO');
							var frameFromBufferAveraged = _.map(subtraction.bufferOneDimensionalFiles.frametolist3VOs, 'frame3VO');

							/** Identify discarded frames */
							for (var i in allFrames) {
								var frame = allFrames[i];
								if (_.find(_.concat(frameFromSampleAveraged, frameFromBufferAveraged), { filePath: frame.filePath })) {
									frame.discarded = false;
								}
								else {
									frame.discarded = true;
								}
								frame.type = 'Frame';
								frame.domId = frame.frameId;
							}

							allFrames = _.orderBy(allFrames, ['filePath'], ['asc']);
							allFrames.unshift({
								filePath: subtraction.substractedFilePath,
								frameId: subtraction.subtractionId,
								domId: subtraction.subtractionId + 'Subtraction',
								type: 'Subtraction'
							});
							allFrames.unshift({
								filePath: subtraction.bufferAverageFilePath,
								frameId: subtraction.subtractionId,
								domId: subtraction.subtractionId + 'BufferAverage',
								type: 'BufferAverage'
							});
							allFrames.unshift({
								filePath: subtraction.sampleAverageFilePath,
								frameId: subtraction.subtractionId,
								domId: subtraction.subtractionId + 'SampleAverage',
								type: 'SampleAverage'
							});
							debugger
							_this.framesGrid.load(allFrames);
						} else {
							_this.framesGrid.load(null);
						}
					}
				}
			};
			EXI.getDataAdapter({ onSuccess: onSuccessSubtractions }).saxs.dataCollection.getDataCollectionsByDataCollectionId(dataCollectionId);
		}
		EXI.getDataAdapter({ onSuccess: onSuccessFrames }).saxs.frame.getFramesByAverageId(_.map(dataCollections, 'Merge_mergeId'));
	}
	EXI.getDataAdapter({ onSuccess: onSuccessA }).saxs.dataCollection.getDataCollectionsById(dataCollectionId);
};

