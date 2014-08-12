			var MyGraph = Class.create(Flotr.Graph, {
				drawCount: 0,
				drawSeries: function($super, series){
					this.drawCount++;
					$super(series);
				}
			});
			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){
				/**
				 * Fill series d1 and d2.
				 */
				var d1 = [];
			    for(var i = 0; i < 14; i += 0.5)
			        d1.push([i, Math.sin(i)]);
			 	
			    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
			    
				/**
				 * Draw the graph.
				 */
			    var f = Flotr.draw($('container'), [ d1, d2 ], null, MyGraph);
			    
			    alert('Draw count: '+f.drawCount);
			});
