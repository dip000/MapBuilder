
	var cutsMap;
	var nrows=1, ncols=1;
	
	function map(x, y){
		if(x == 0 || y == 0)
			return;
		
		if( !AskForReset() ) return;
		
		initializeMapEditorGrid(x, y);
	}
	
	function rows(numberOfRows){
		
		
		UpdateCutsMap(TARGET_ROWS, nrows, JOIN);
		UpdateCutsMap(TARGET_ROWS, numberOfRows, CUT);
		
		UpdateCutsMap(TARGET_COLS, ncols, CUT);
		nrows = numberOfRows;
	}
	
	function cols(numberOfCols){

		UpdateCutsMap(TARGET_COLS, ncols, JOIN);
		UpdateCutsMap(TARGET_COLS, numberOfCols, CUT);
		
		UpdateCutsMap(TARGET_ROWS, nrows, CUT);
		ncols = numberOfCols;
	}
	
	
	const TARGET_ROWS = true;
	const TARGET_COLS = false;
	const CUT = true;
	const JOIN = false;
	
	function UpdateCutsMap(target, numberOfSuch, state){
		let x, y;
		let mapLengthB, mapLengthA;

		if(target == TARGET_ROWS){
			mapLengthA = occupancyMap.length;
			mapLengthB = occupancyMap[0].length;
		}
		else{
			mapLengthB = occupancyMap.length;
			mapLengthA = occupancyMap[0].length;
		}
		
		let increment = mapLengthA / numberOfSuch;
		let incrementRounded = Math.round( increment );
		
		if(numberOfSuch <= 0){
			console.log("Cannot make that few");
			return;
		}
		if(numberOfSuch > Math.round( mapLengthA/2 )){
			console.log("Cannot make that many");
			return;
		}
		

		
		for(let i=0; i<numberOfSuch-1; i++){
			for(let j=0; j<mapLengthB; j++){
				if(target == TARGET_ROWS){
					y = j;
					x = incrementRounded*(i+1)-1;
				}
				else{
					x = j;
					y = incrementRounded*(i+1)-1;
				}
				
				if(state == CUT){
					printVisualsOfCoordenates(new Vector2Array(x, y), mapCutColor);
					cutsMap[x][y] = true;
					occupancyMap[x][y] = null;
				}
				else{
					printVisualsOfCoordenates(new Vector2Array(x, y), clearedGridColor);
					cutsMap[x][y] = false;
					occupancyMap[x][y] = FREE;
				}
			}
		}
	}
	
	function AskForReset(){
		let coordenates = OccupancyMapToCoordenates(occupancyMap);
		if( (coordenates.x.length != 0) && (confirm("Requires a reset. Continue?") == false) )
			return false;
	
		if(table != null)
			document.getElementById("GridGraphics").removeChild(table);

		ResetMap();
		return true;
	}
	

	