		  function getV(nl) {
		    var v = null;
		    $A(nl).each(function(e) {
		      if (e.checked) {
		        v = e.value;
			      return;
			    }
		    });
		    return v;
		  }
		
		  var f;
			/**
			 * Wait till dom's finished loading.
			 */
			document.observe('dom:loaded', function(){
        var d1 = [];
        var d2 = [];
        var d3 = [];
        var d4 = [];
        var d5 = [];
        
        for(var i = 0; i <= 10; i += 0.1){
          d1.push([i, 4 + Math.pow(i,1.5)]);
          d2.push([i, Math.pow(i,3)]);
          d3.push([i, i*5+3*Math.sin(i*4)]);
          d4.push([i, i]);
          if( i.toFixed(1)%1 == 0 ){
            d5.push([i, 2*i]);
          }
        }
                
        /**
         * Draw the graph.
         */
        f = Flotr.draw(
          $('container'),[ 
            {data:d1, label:'y = 4 + x^(1.5)', lines:{fill:true}}, 
            {data:d2, label:'y = x^3'}, 
            {data:d3, label:'y = 5x + 3sin(4x)'}, 
            {data:d4, label:'y = x'},
            {data:d5, label:'y = 2x', lines: {show: true}, points: {show: true}}
          ],{
            xaxis:{
              noTicks: 7, // Display 7 ticks.
              tickFormatter: function(n){ return '('+n+')'; }, // => displays tick values between brackets.
              min: 1,   // => part of the series is not displayed.
              max: 7.5  // => part of the series is not displayed.
            },
            yaxis:{
              ticks: [[ 0, "Lower"], 10, 20, 30, [40, "Upper"]],
              max: 40
            },
            grid:{
              verticalLines: false,
              backgroundColor: 'white'
            },
            legend: {
              position: 'nw'
            },
            spreadsheet: {
              show: true
            }
        });
			});
