
	var cutsMap;
	var nrows=1, ncols=1;
	
	function map(x, y){
		if(x == 0 || y == 0)
			return;
		
		if( !AskForReset() ) return;
		
		initializeMapEditorGrid(x, y);
	}
	
	function rows(numberOfRows){
		
		let maxRows = Math.round( occupancyMap.length/2 );
		if(numberOfRows <= 0){
			console.log("Applied minimum (1) instead");
			numberOfRows = 1;
		}
		if(numberOfRows > maxRows){
			console.log("Applied maximum ("+maxRows+") instead");
			numberOfRows = maxRows;
		}
		
		UpdateCutsMap(TARGET_ROWS, nrows, JOIN);
		UpdateCutsMap(TARGET_ROWS, numberOfRows, CUT);
		
		UpdateCutsMap(TARGET_COLS, ncols, CUT);
		nrows = numberOfRows;
	}
	
	function cols(numberOfCols){

		let maxCols = Math.round( occupancyMap[0].length/2 );
		if(numberOfCols <= 0){
			console.log("Applied minimum (1) instead");
			numberOfCols = 1;
		}
		if(numberOfCols > maxCols){
			console.log("Applied maximum ("+maxCols+") instead");
			numberOfCols = maxCols;
		}
		
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

	function FormatOutput(){
		const numberOfInstructions = historyOfPlacements.length;

		const mapLengthRows = occupancyMap.length;
		const mapLengthCols = occupancyMap[0].length;

		//Not considenring the space occupied for map cuts
		const availableRows = mapLengthRows-(nrows-1);
		const availableCols = mapLengthCols-(ncols-1);
		
		//Number of rows, cols of each island and its residue due map size
		const islandSizeRows =  Math.floor( availableRows/nrows );
		const islandSizeCols =  Math.floor( availableCols/ncols );
		const residueRows =  availableRows % nrows;
		const residueCols =  availableCols % ncols;

		let outputData = new Array();

		for(var i=0; i<numberOfInstructions; i++){
		
			//Skip the search if it was marked as deleted
			if(historyOfPlacements[i].deleted == true){
				continue;
			}
			
			//TODO: positionsX and positionsY are not always a part of the item. Use coordenates.x[0] instead
			let row = historyOfPlacements[i].coordenates.x[0];
			let col = historyOfPlacements[i].coordenates.y[0];

			for(var r=0; r<nrows; r++){
				for(var c=0; c<ncols; c++){
					
					//Make all maps including empty ones
					if(outputData[r] == null){
						outputData[r] = new Array();
					}
					if(outputData[r][c] == null){
						outputData[r][c] = new OutputData();
					}
					
					//Localizating current item by looking at previous and next rows and cols
					if( row>islandSizeRows*r && row<islandSizeRows*(r+1) && col>islandSizeCols*c  && col<islandSizeCols*(c+1) ){
						console.log("Found type: " + listOfShapeNames[ historyOfPlacements[i].itemType ] + " in ("+ r +","+c+") island");
						
						//add info on its respective map
						outputData[r][c].itemTypes.push(historyOfPlacements[i].itemType);
						outputData[r][c].itemRotations.push(historyOfPlacements[i].rotation);
						outputData[r][c].positionsX.push(historyOfPlacements[i].positionX);
						outputData[r][c].positionsY.push(historyOfPlacements[i].positionY);
						
						//redoundant here but whatever
						outputData[r][c].mapSizeX = islandSizeRows;
						outputData[r][c].mapSizeY = islandSizeCols;
					}
				}
			}
		}

		
		//Stringify the output
		console.log("residueRows: " +residueRows + "; residueCols: " +residueCols);
		let outString = "";
		for(var r=0; r<outputData.length; r++){
			for(var c=0; c<outputData[0].length; c++){
				
				//PositionsX and positionsY are not always a part of the item.
				let formatedCoordenates = new Vector2Array( outputData[r][c].coordenates.x[0], outputData[r][c].coordenates.y[0] );
				let originRows = (islandSizeRows+1) * r;
				let originCols = (islandSizeCols+1) * c;

				
				console.log("r: " +r + "; c: " + c);
				console.log(outputData[r][c].positionsX+ "--" + outputData[r][c].positionsY);
				let globalizedCoordenates = GlobalizeCoordenates( formatedCoordenates, -originRows,  -originCols);
				//console.log(new Vector2Array(globalizedCoordenates));

				let rotatedCoordenates = RotatePerfect( globalizedCoordenates, islandSizeRows-1 );
				console.log(new Vector2Array(rotatedCoordenates));

				outputData[r][c].positionsX = rotatedCoordenates.x;
				outputData[r][c].positionsY = rotatedCoordenates.y;

				outString += JSON.stringify( outputData[r][c] );
				outString += "&";
			}
		}

		outString = outString.slice(0, -1);
		return outString;
	}
	

	