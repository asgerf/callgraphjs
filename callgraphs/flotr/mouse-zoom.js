			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){
				/**
				 * Fill series d1 and d2.
				 */
				var d1 = [];
				var d2 = [];
				var d3 = [];
			    for(var i = 0; i < 40; i += 0.5){
			        d1.push([i, Math.sin(i)+3*Math.cos(i)]);
					d2.push([i, Math.pow(1.1, i)]);
					d3.push([i, 40 - i+Math.random()*10]);
				}
			    
				/**
				 * Global options object.
				 */
				var options = {
					selection:{mode:'x',fps:30}
				};
				
				/**
				 * Function displays a graph in the 'container' element, extending
				 * the global options object with the optionally passed options.
				 */
				function drawGraph(opts){
					/**
					 * Clone the options, so the 'options' variable always keeps intact.
					 */
					var o = Object.extend(Object.clone(options), opts || {});
					/**
					 * Return a new graph.
					 */
					return Flotr.draw(
						$('container'), 
						[ d1, d2, d3 ],
						o
					);
				}	
				
				/**
				 * Actually draw the graph.
				 */
				var f = drawGraph();			
				
				/**
				 * Hook into the 'flotr:select' event.
				 */
				$('container').observe('flotr:select', function(evt){
					/**
					 * Get the selected area coordinates passed as event memo.
					 */
					var area = evt.memo[0];
					
					/**
					 * What happens: empty the container element, and draw a new 
					 * graph with bounded axis. The axis correspond to the selection
					 * you just made.
					 */
					f = drawGraph({
						xaxis: {min:area.x1, max:area.x2},
						yaxis: {min:area.y1, max:area.y2}
					});
				});
				
				/**
				 * Observe click event on the reset-btn. Reset the graph when clicked.
				 * The drawGraph function wrapped in another function otherwise it get's 
				 * an Event object passed as first argument, while it expects an options
				 * object.
				 */
				$('reset-btn').observe('click', function(){drawGraph()});
			});
