

		
		function OccupancyMapToCoordenates(occupancyMap){
			if(occupancyMap == null) return;
			
			let coordenates = new Vector2Array();
			let k = 0;
			let mapLengthX = occupancyMap.length;
			let mapLengthY = occupancyMap[0].length;
			
            for(var i=0; i<mapLengthX; i++){
				for(var j=0; j<mapLengthY; j++){
					if(occupancyMap[i][j] == true){
						coordenates.x[k] = i;
						coordenates.y[k] = j;
						k++;
					}
				}
			}
			
			return coordenates;
		}
		
        function LocalizeCoordenates(vector2){
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
			
            console.log("LOCALIZED TO MIN VALUE: ");
            console.log("minX " + minX + "; minY " + minY);
            console.log(vector2);
			
			return vector2;
        }
		
		function GlobalizeCoordenates(shape, x, y){			
			let coordenatesa = new Vector2Array(shape);
			
			for(let i=0; i<shape.x.length; i++){
                coordenatesa.x[i] += x;
                coordenatesa.y[i] += y;
            }
            //console.log("GLOBALIZED TO TARGET VALUE: ");
            //console.log(coordenates);
			return coordenatesa;
		}
		
		function RotateCoordenatesByAngle(coordenates, angle){
			//console.log("RESULT angle: " + angle);
			
			if(angle<0){
				angle = -(angle%360)/90;
			}
			else{
				angle = 4-(angle%360)/90;
			}
			
			angle = Math.round(angle);
			
			if(angle == 4) return coordenates;
			
			let rotatedCoordenates = new Vector2Array(coordenates);
			
			//console.log("RESULT times: " + angle);
			for(let i=0; i<angle; i++){
				 rotatedCoordenates = RotateCoordenates90Clockwise(rotatedCoordenates);
			}
			
			return rotatedCoordenates;
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
		
        function RotateCoordenates90Clockwise(vector2){
			
            //Flip axis. This actually mirors coordenates by 45 degrees
            var maxY = 0;
            for(var i=0; i<vector2.x.length; i++){
				var switchReg = vector2.x[i];
                vector2.x[i] = vector2.y[i];
                vector2.y[i] = switchReg;
				
                if(vector2.y[i] > maxY){
                    maxY =  vector2.y[i];
                }
            }
			
            //Miror y axis. Both instructions actually rotate the coordenates 90° counteclockwise
            // and that can be seen as switching from row-cols system to x-y cartesian system
            for(var i=0; i<vector2.x.length; i++){
                vector2.y[i] = maxY - vector2.y[i];
            }
           
            //console.log("ROTATED BY 90 CLOCKWISE: ");
            //console.log(vector2);
			
			return vector2;
       }
	   
	   
	   function GetMaxValueOfCoordenates(coordenates){
		   let maxValue = 0;
		   
		   for( let i=0; i<coordenates.x.length; i++ ){
			   if(coordenates.x[i] > maxValue){
				   maxValue = coordenates.x[i];
			   }
			   if(coordenates.y[i] > maxValue){
				   maxValue = coordenates.y[i];
			   }
		   }
		   
		   return maxValue;
	   }
	   
	   function GetMinValuesOfCoordenates(coordenates){
		   let minValue = {x:0, y:999};
		   
		   for( let i=0; i<coordenates.x.length; i++ ){
			   if(coordenates.x[i] > minValue.x){
				   minValue.x = coordenates.x[i];
			   }
			   if(coordenates.y[i] < minValue.y){
				   minValue.y = coordenates.y[i];
			   }
		   }
		   
		   return minValue;
	   }
	   
	   function GetMaxValuesOfCoordenates(coordenates){
		   let maxValue = {x:0, y:0};
		   
		   for( let i=0; i<coordenates.x.length; i++ ){
			   if(coordenates.x[i] > maxValue.x){
				   maxValue.x = coordenates.x[i];
			   }
			   if(coordenates.y[i] > maxValue.y){
				   maxValue.y = coordenates.y[i];
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
		
		function AverageVolume(coordenates){
			let average = {x:0, y:0};
			for(let i=0; i<coordenates.x.length; i++){
				average.x += coordenates.x[i];
				average.y += coordenates.y[i];
			}
			
			average.x /= coordenates.x.length;
			average.y /= coordenates.y.length;
			
			return average;
		}		