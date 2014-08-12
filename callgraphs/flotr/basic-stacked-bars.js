			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){
				/**
				 * Fill series.
				 */
				var d1 = [], d2 = [], d3 = [];
				for (i = 0; i < 10; i++) {
				  d1[i] = [i, Math.random()];
				  d2[i] = [i, Math.random()];
				  d3[i] = [i, Math.random()];
				}
			
				/**
				 * Draw the graph.
				 */
			    var f = Flotr.draw(
					$('container'), [
						{data:d1, label:'Serie 1'},
						{data:d2, label:'Serie 2'},
						{data:d3, label:'Serie 3'}
					],{
						legend:{
							backgroundColor: '#D2E8FF' // => a light blue background color.
						},
						bars: {
						  show: true,
              stacked: true,
              //horizontal: true,
              barWidth: 0.6
						},
						grid: {
						  verticalLines: false
						},
						spreadsheet:{show: true}
					}
				);
			});
