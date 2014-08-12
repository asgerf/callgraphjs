		/**
		 * Wait till dom's finished loading.
		 */
		document.observe('dom:loaded', function(){
			/**
			 * Fill series d0, d1 and d2. 
			 * 
			 * The first series is just a line through y = 0.
			 * The second series will contain random data presented as a scatter plot. 
			 * The third series draws the regression line. 
			 * 
			 * Please don't be distracted by the math.
			 */
			var d0 = [];
			var d1 = [];
			var d2 = [];
							
			var n, x, y, sx = 0, sy = 0, sxy = 0, sxsq = 0;
			for(n = 0; n < 20; n++){
				x = n;
				y = x + Math.random()*8 - 15;
				d0.push([x, 0]);
		        d1.push([x, y]);
				
				/**
				 * Do some math, we need these later to compute the regression line.
				 */
				sx += x;
				sy += y;
				sxy += x*y;
				sxsq += Math.pow(x,2);
			}
		
			var xmean = sx/n;
			var ymean = sy/n;
			var beta = ((n*sxy) - (sx*sy))/((n*sxsq)-(Math.pow(sx,2)));
			var alpha = ymean - (beta * xmean);
			
			/**
			 * Compute the regression line.
			 */
			for(var i = 0; i < 20; i++){
				d2.push([i, alpha + beta*i])
			}			
					    
			/**
			 * Draw the graph.
			 */
		    var f = Flotr.draw(
				$('container'), [ 
					{data:d0, shadowSize:0, color:'#545454'}, // => Horizontal line through y = 0
					{data:d1, label:'y = x + (Math.random() * 8) - 15', points:{ show:true } },	// => Scatterplot
					{data:d2, label:'y = '+alpha.toFixed(2)+' + ' + beta.toFixed(2) + '*x'}	// => Regression line																
				],
				{
					legend:{position:'se',backgroundColor: '#D2E8FF'}
				}
			);
		});
