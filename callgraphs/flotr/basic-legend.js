
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
			    for(var i = 0; i < 15; i += 0.5){
			        d1.push([i, i + Math.sin(i+Math.PI)]);
					d2.push([i, i]);
					d3.push([i, 15-Math.cos(i)]);
				}
			
				/**
				 * This function prepend each label with 'y = '.
				 */
				function myLabelFunc(label){
					return 'y = ' + label;
				}
			
				/**
				 * Draw the graph.
				 */
			    var f = Flotr.draw(
					$('container'), [ 
						{data:d1, label:'x + sin(x+&pi;)'},
						{data:d2, label:'x'},
						{data:d3, label:'15 - cos(x)'}											
					],{
						legend:{
							position: 'se', // => position the legend 'south-east'.
							labelFormatter: myLabelFunc, // => format the labels.
							backgroundColor: '#D2E8FF' // => a light blue background color.
						},
						HtmlText: false
					}
				);
			});	
