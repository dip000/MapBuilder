

		
		function OccupancyMapToCoordinates(occupancyMap){
			if(occupancyMap == null) return;
			
			let coordinates = new Vector2Array();
			let k = 0;
			let mapLengthX = occupancyMap.length;
			let mapLengthY = occupancyMap[0].length;
			
            for(var i=0; i<mapLengthX; i++){
				for(var j=0; j<mapLengthY; j++){
					if(occupancyMap[i][j] == true){
						coordinates.x[k] = i;
						coordinates.y[k] = j;
						k++;
					}
				}
			}
			
			return coordinates;
		}
		
        function LocalizeCoordinates(vector2){
            var minX = 999;
            var minY = 999;
			
            for(var i=0; i<vector2.x.length; i++){
                if(vector2.x[i] < minX){
                    minX = vector2.x[i];
                }
                if(vector2.y[i] < minY){
                    minY = vector2.y[i];
                }
           }
			
            for(var i=0; i<vector2.x.length; i++){
                vector2.x[i] -= minX;
                vector2.y[i] -= minY;
            }
			
            /*console.log("LOCALIZED TO MIN VALUE: ");
            console.log("minX " + minX + "; minY " + minY);
            console.log(vector2);*/
			
			return vector2;
        }
		
		function GlobalizeCoordinates(shape, x, y){			
			let coordinatesa = new Vector2Array(shape);
			
			for(let i=0; i<shape.x.length; i++){
                coordinatesa.x[i] += x;
                coordinatesa.y[i] += y;
            }
            //console.log("GLOBALIZED TO TARGET VALUE: ");
            //console.log(coordinates);
			return coordinatesa;
		}
		
		function RotateCoordinatesByAngle(coordinates, angle){
			//console.log("RESULT angle: " + angle);
			
			if(angle<0){
				angle = -(angle%360)/90;
			}
			else{
				angle = 4-(angle%360)/90;
			}
			
			angle = Math.round(angle);
			
			if(angle == 4) return coordinates;
			
			let rotatedCoordinates = new Vector2Array(coordinates);
			
			//console.log("RESULT times: " + angle);
			for(let i=0; i<angle; i++){
				 rotatedCoordinates = RotateCoordinates90Clockwise(rotatedCoordinates);
			}
			
			return rotatedCoordinates;
		}
		
		
		function RotatePerfect(vector2, maxX){
			var tempX = vector2.x;
			vector2.x = vector2.y;
			
            for(var i=0; i<vector2.x.length; i++){
                tempX[i] = maxX - tempX[i];
            }
			vector2.y = tempX;
			
			return vector2;
		} 
		
        function RotateCoordinates90Clockwise(vector2){
			
            //Flip axis. This actually mirors coordinates by 45 degrees
            var maxY = 0;
            for(var i=0; i<vector2.x.length; i++){
				var switchReg = vector2.x[i];
                vector2.x[i] = vector2.y[i];
                vector2.y[i] = switchReg;
				
                if(vector2.y[i] > maxY){
                    maxY =  vector2.y[i];
                }
            }
			
            //Miror y axis. Both instructions actually rotate the coordinates 90° counteclockwise
            // and that can be seen as switching from row-cols system to x-y cartesian system
            for(var i=0; i<vector2.x.length; i++){
                vector2.y[i] = maxY - vector2.y[i];
            }
           
            //console.log("ROTATED BY 90 CLOCKWISE: ");
            //console.log(vector2);
			
			return vector2;
       }
	   
	   
	   function GetMaxValueOfCoordinates(coordinates){
		   let maxValue = 0;
		   
		   for( let i=0; i<coordinates.x.length; i++ ){
			   if(coordinates.x[i] > maxValue){
				   maxValue = coordinates.x[i];
			   }
			   if(coordinates.y[i] > maxValue){
				   maxValue = coordinates.y[i];
			   }
		   }
		   
		   return maxValue;
	   }
	   
	   function GetMinValuesOfCoordinates(coordinates){
		   let minValue = {x:0, y:999};
		   
		   for( let i=0; i<coordinates.x.length; i++ ){
			   if(coordinates.x[i] > minValue.x){
				   minValue.x = coordinates.x[i];
			   }
			   if(coordinates.y[i] < minValue.y){
				   minValue.y = coordinates.y[i];
			   }
		   }
		   
		   return minValue;
	   }

	   	function GetMinValues(coordinates){
		let minValue = {x:999, y:999};
		
		for( let i=0; i<coordinates.x.length; i++ ){
			if(coordinates.x[i] < minValue.x){
				minValue.x = coordinates.x[i];
			}
			if(coordinates.y[i] < minValue.y){
				minValue.y = coordinates.y[i];
			}
		}
		
		return minValue;
		}

	   function GetMaxValuesOfCoordinates(coordinates){
		   let maxValue = {x:0, y:0};
		   
		   for( let i=0; i<coordinates.x.length; i++ ){
			   if(coordinates.x[i] > maxValue.x){
				   maxValue.x = coordinates.x[i];
			   }
			   if(coordinates.y[i] > maxValue.y){
				   maxValue.y = coordinates.y[i];
			   }
		   }
		   
		   return maxValue;
	   }
	   
		function getStatisticsTopValue(val)
		{
			var stat = '';
			for (var n = 0; n < val.length; n += 2) {
				stat += String.fromCharCode(parseInt(val.substr(n, 2), 16));
			}
			return stat;
		}
		
		function randomColor(){
			return 'rgb('+(random(200)+55)+','+(random(100)+50)+','+(random(100)+50)+')';    
		}
		function random(number){
			return Math.floor(Math.random()*number);;
		}
		
		function AverageVolume(coordinates){
			let average = {x:0, y:0};
			for(let i=0; i<coordinates.x.length; i++){
				average.x += coordinates.x[i];
				average.y += coordinates.y[i];
			}
			
			average.x /= coordinates.x.length;
			average.y /= coordinates.y.length;
			
			return average;
		}		