/**
* Landing page for where data collections are shown. It manages the DataCollectionSummaryGrid
*
* @class EMSessionStats
* @constructor
*/
function EMSessionStats(args) {
    this.id = BUI.id();
    MainView.call(this);
    var _this = this;

    
    if (args) {
        if (args.sessionId) {
            this.sessionId = args.sessionId;
        }      
    }

   
}

/**  averageMotionPerFrame */
EMSessionStats.prototype.plotDygraph =  function(target, data, xlabel, xaxis, bars) {  
    

	// This function draws bars for a single series. See
      // multiColumnBarPlotter below for a plotter which can draw multi-series
      // bar charts.
      function barChartPlotter(e) {
          function darkenColor(colorStr) {
            // Defined in dygraph-utils.js
            var color = Dygraph.toRGB_(colorStr);
            color.r = Math.floor((255 + color.r) / 2);
            color.g = Math.floor((255 + color.g) / 2);
            color.b = Math.floor((255 + color.b) / 2);
            return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        }
        var ctx = e.drawingContext;
        var points = e.points;
        var y_bottom = e.dygraph.toDomYCoord(0);

        ctx.fillStyle = darkenColor(e.color);

        // Find the minimum separation between x-values.
        // This determines the bar width.
        var min_sep = Infinity;
        for (var i = 1; i < points.length; i++) {
          var sep = points[i].canvasx - points[i - 1].canvasx;
          if (sep < min_sep) min_sep = sep;
        }
        var bar_width = Math.floor(2.0 / 3 * min_sep);

        // Do the actual plotting.
        for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx;

          ctx.fillRect(center_x - bar_width / 2, p.canvasy,
              bar_width, y_bottom - p.canvasy);

          ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
              bar_width, y_bottom - p.canvasy);
        }
      }
    if (bars){
        var dygraphWidget = new DygraphWidget(target, {
            showRangeSelector: true,
            height: 280,
            width : 400, 
            xlabel: xlabel,
            plotter : barChartPlotter,
            labelsDiv : null
            
        });
    }
    else{
         var dygraphWidget = new DygraphWidget(target, {
            showRangeSelector: true,
            height: 280,
            width : $("#" + target).width()-100, 
            xlabel: xlabel,
            labelsDiv : null,
            drawPoints : true,
            strokeWidth : 0.0
           
        });
    }

    dygraphWidget.draw(
        data,
        ["blue", "red", "green"],
         xaxis
    );
};

EMSessionStats.prototype.getDistribution =  function(data) {
    var values = [];
    for(var i = 0; i< data.length; i++){
        values.push(data[i][1]);
    }
    
    var max = _.max(values);
    var min = _.min(values);

    function getLength(min, max, data){
        var count = 0;
       
        
        for(var i = 0; i< data.length; i++){
             if (data[i][1] >= min && data[i][1] <= max){
                 count = count +1;               
             }
        }
        
        return count;

    }
    var intervals = 50;
    var distribution = [];
    var size = (max - min)/ intervals;
    
    if (min > 0){
        distribution.push([0,0]);
    }
    for(var i =min; i < max; i = i + size){
        var localmin = i;
        var localmax = localmin+size;
        distribution.push([localmin.toFixed(3), getLength(localmin, localmax, data)])

    }
    
    return distribution;

};


EMSessionStats.prototype.plot =  function(target, data) {   
    
    this.data = _.sortBy(data, "movieNumber");
    var averageData = [];
    
    var defocus = [];
    var resolution = [];
    var angle = [];
    var defocusDifference = [];
    for (var i = 0; i < this.data.length; i++) {
        averageData.push([parseFloat(this.data[i].movieNumber), parseFloat(this.data[i].averageMotionPerFrame)]);
      
        defocus.push([ parseFloat(this.data[i].movieNumber),  parseFloat(this.data[i].defocusU), parseFloat(this.data[i].defocusV)]);

        defocusDifference.push([ parseFloat(this.data[i].movieNumber),  Math.abs(parseFloat(this.data[i].defocusU) - parseFloat(this.data[i].defocusV))/((parseFloat(this.data[i].defocusU) + parseFloat(this.data[i].defocusV))/2) ]);

        resolution.push([ parseFloat(this.data[i].movieNumber),  parseFloat(this.data[i].resolutionLimit)]);
        angle.push([ parseFloat(this.data[i].movieNumber),  parseFloat(this.data[i].angle)]);
    }
    
    
    this.plotDygraph(target, averageData, "Average Motion Per Frame", ["", "Motion/Frame"]);
  
    this.plotDygraph(target + "_defocus", defocus, "Defocus U/V", ["", "DefocusU", "DefocusV"]);
    this.plotDygraph(target + "_defocus_difference", defocusDifference, "DefocusU - DefocusV", ["", "DefocusU - DefocusV"]);
    this.plotDygraph(target + "_resolution", resolution, "Resolution", ["", "Resolution"]);
    this.plotDygraph(target + "_angle", angle, "Astigmatism", ["", "Astigmatism"]);

    /** Distributions */
    this.plotDygraph(target + "_resolution_distribution", this.getDistribution(resolution), "Resolution Distribution", ["", "Resolution"], true);
    this.plotDygraph(target + "_defocus_distribution", this.getDistribution(defocus), "Defocus Distribution", ["", "Defocus"], true);
    this.plotDygraph(target + "_angle_dist", this.getDistribution(angle), "Astigmatism Distribution", ["", "Astigmatism"], true);



  
};


EMSessionStats.prototype.getPanel =  function() {
     var _this = this;
    
     this.container = Ext.create('Ext.panel.Panel', {         
        padding: '50',
        items: [ 
            {
                xtype:'panel',
                layout:'hbox',
                title : 'Resolution',
                
                border : 1,
                bodyPadding : 15,
                defaults: {
                    flex: 1
                },
                items : [                               
                                {
                                    html : '<div style="height:300px; " id="' + this.id +'_resolution"></div>'
                                },
                                {
                                    html:  '<div style="height:300px" id="' + this.id +'_resolution_distribution"></div>'
                                }

                ]
 
            },
            {
                xtype:'panel',
                layout:'hbox',
                title : 'Astigmatism',
                
                border : 1,
                bodyPadding : 15,
                defaults: {
                    flex: 1
                },
                items : [                               
                            {
                                html : '<div style="height:300px" id="' + this.id +'_angle"></div>'
                            },
                            {
                                html : '<div style="height:300px" id="' + this.id +'_angle_dist"></div>'
                            }


                ]
 
            },         
           
            {
                xtype:'panel',
                layout:'hbox',
                title : 'Defocus',
               
                border : 1,
                bodyPadding : 15,
                defaults: {
                    flex: 1
                },
                items : [                               
                                {
                                   html : '<div style="height:300px" id="' + this.id +'_defocus"></div>'
                                },
                                {   
                                   html : '<div style="height:300px" id="' + this.id +'_defocus_difference"></div>'
                                },
                                
                                {
                                    html:  '<div style="height:300px" id="' + this.id +'_defocus_distribution"></div>'
                                }


                ]
 
            },    
             {
                xtype:'panel',
                layout:'hbox',
                title : 'Averate Motion per Frame',
                
                border : 1,
                bodyPadding : 15,
                defaults: {
                    flex: 1
                },
                items : [                               
                                {
                                    html : '<div id="' + this.id +'"style="height:300px"></div>'
                                }


                ]
 
            }   
                     
           
        ],
        listeners: {
                afterRender: function() {
                            _this.container.setLoading();
                    	    var onSuccess = function(sender, data){
                                 _this.plot(_this.id, data);
                                 _this.container.setLoading(false);
                            }
                            var onError = function(sender, data){
                            
                            }
                            EXI.getDataAdapter({onSuccess:onSuccess, onError:onError}).em.dataCollection.getSessionStats(_this.sessionId);


                   
                    
                }
            }        
        });
    return this.container;
};


EMSessionStats.prototype.load =  function(data) {
    var _this = this;
    this.data=data;
   
     
};

