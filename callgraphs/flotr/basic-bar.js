			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){
				/**
				 * Fill series d1 and d2 width random values.
				 */
				var d1 = [];
				var d2 = [];				
			    for(var i = 0; i < 4; i++ ){
					d1.push([i,Math.ceil(Math.random()*10)]);
					d2.push([i+0.5, Math.ceil(Math.random()*10)]);
				}
				
				/**
				 * Draw the graph in the first container.
				 */
				Flotr.draw(
					$('container'),
					[d1, d2],
					{bars: {show:true, barWidth:0.5},
					 yaxis: {min: 0}
					}
				);
			});	
