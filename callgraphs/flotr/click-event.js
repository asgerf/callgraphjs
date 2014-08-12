			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){			
				/**
				 * Default options.
				 */
				var options = {
					xaxis: {min: 0, max: 15},
					yaxis: {min: 0, max: 15},
					lines: {show: true},
					points: {show: true},
					mouse: {track:true}
				};
				
				/**
				 * Start with a single coordinate in the origin.
				 */
				var d1 = [[0,0]];
						    
				/**
				 * Draw an empty graph and configure the axis.
				 */
				var f = Flotr.draw($('container'), [d1], options);
				
				/**
				 * Observe the 'flotr:click' event. When the graph is clicked, add the click
				 * position to the d1 series and redraw the graph.
				 */
				$('container').observe('flotr:click', function(event){
					// Retrieve where the user clicked.
					var position = event.memo[0];
					
					// Store the click position in the d1 series.
					d1.push([position.x, position.y]);
					
					// Sort the series.
					d1 = d1.sort(function(a, b){ return a[0] - b[0]; });
					
					// Redraw the graph, with the new series.
					f = Flotr.draw($('container'), [d1], options);
				});
			});	
