
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

		const islandSizeRows =  Math.round(mapLengthRows/nrows) - (nrows-1) + 1;
		const islandSizeCols =  Math.round(mapLengthCols/ncols) - (ncols-1) + 1;

		let outputData = new Array();

		for(var i=0; i<numberOfInstructions; i++){
		
			//Skip the search if it was marked as deleted
			if(historyOfPlacements[i].deleted == true){
				continue;
			}
			
			let row = historyOfPlacements[i].positionX;
			let col = historyOfPlacements[i].positionY;

			for(var r=0; r<nrows; r++){
				for(var c=0; c<ncols; c++){
					if( row>islandSizeRows*r && row<islandSizeRows*(r+1) && col>islandSizeCols*c  && col<islandSizeCols*(c+1) ){
						console.log("Found type: " + listOfShapeNames[ historyOfPlacements[i].itemType ] + " in ("+ r +","+c+") island");
						
						if(outputData[r] == null){
							outputData[r] = new Array();
						}
						if(outputData[r][c] == null){
							outputData[r][c] = new OutputData();
						}
						outputData[r][c].itemTypes.push(historyOfPlacements[i].itemType);
						outputData[r][c].itemRotations.push(historyOfPlacements[i].rotation);
						outputData[r][c].positionsX.push(historyOfPlacements[i].positionX);
						outputData[r][c].positionsY.push(historyOfPlacements[i].positionY);
						
						outputData[r][c].mapSizeX = islandSizeRows;
						outputData[r][c].mapSizeY = islandSizeCols;
					}
				}
			}
		}

		let outString = "";
		for(var i=0; i<outputData.length; i++){
			for(var j=0; j<outputData[0].length; j++){
				
				let formatedCoordenates = new Vector2Array( outputData[i][j].positionsX, outputData[i][j].positionsY );

				console.log(outputData[i][j].positionsX+ "--" + outputData[i][j].positionsY);
				//console.log(new Vector2Array(formatedCoordenates));
				let globalizedCoordenates = GlobalizeCoordenates( formatedCoordenates, -i*islandSizeRows, -j*islandSizeCols );
				console.log("-i*islandSizeRows: "+(-i*islandSizeRows)+"; -j*islandSizeCols: "+(-j*islandSizeCols));
				//console.log(new Vector2Array(globalizedCoordenates));

				let residueX = (mapLengthRows-(nrows-1)) % nrows;
				let residueY = (mapLengthCols-(ncols-1)) % ncols;

				let rotatedCoordenates = RotatePerfect( globalizedCoordenates, (islandSizeRows + residueX-1));
				console.log(new Vector2Array(rotatedCoordenates));
				console.log("residueX: " +residueX);
				console.log("residueY: " +residueY);
				console.log("(islandSizeRows + residueX-1): " +(islandSizeRows + residueX-1));

				outputData[i][j].positionsX = rotatedCoordenates.x;
				outputData[i][j].positionsY = rotatedCoordenates.y;

				outString += JSON.stringify( outputData[i][j] );
				outString += "&";
			}
		}

		outString = outString.slice(0, -1);
		return outString;
	}
	

	