
	var cutsMap;
	var nrows=1, ncols=1;
	
	function map(x, y){
		if(x <= 0 || y <= 0) return;
		
		if( !AskForReset() ) return;

		ResetOccupancyMap();

		if(table != null){
			document.getElementById("GridGraphics").removeChild(table);
			table = null;
		}
		initializeMapEditorGrid(x, y);
		ResetCutsMap();
	}
	
	function ResetCutsMap(){
		rows(nrows);
		cols(ncols);
	}

	function AskForReset(){
		let coordenates = OccupancyMapToCoordenates(occupancyMap);
		if( (coordenates.x.length != 0) && (confirm("Requires a reset. Continue?") == false) )
			return false;
	
		return true;
	}

	function rows(numberOfRows){
		if( !AskForReset() ) return;

		ResetOccupancyMap();
		if(table != null){
			document.getElementById("GridGraphics").removeChild(table);
			table = null;
		}
		initializeMapEditorGrid(occupancyMap.length, occupancyMap[0].length);

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

		if( !AskForReset() ) return;
		ResetOccupancyMap();
		if(table != null){
			document.getElementById("GridGraphics").removeChild(table);
			table = null;
		}
		initializeMapEditorGrid(occupancyMap.length, occupancyMap[0].length);

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
		let nSuch;

		if(target == TARGET_ROWS){
			mapLengthA = occupancyMap.length;
			mapLengthB = occupancyMap[0].length;
			nSuch = nrows;
		}
		else{
			mapLengthB = occupancyMap.length;
			mapLengthA = occupancyMap[0].length;
			nSuch = ncols;
		}

		const available = mapLengthA-(nSuch-1);
		const islandSize = available / numberOfSuch;
		const islandSizeWithCut = islandSize + 1;
		const increment = Math.floor( islandSizeWithCut );
		
		for(let i=0; i<numberOfSuch-1; i++){
			for(let j=0; j<mapLengthB; j++){
				if(target == TARGET_ROWS){
					y = j;
					x = increment*(i+1)-1;
				}
				else{
					x = j;
					y = increment*(i+1)-1;
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
			
			//PositionsX and positionsY are not always a part of the item.
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

					//console.log("r,c from: "+(islandSizeRows+1)*r + "," + (islandSizeCols+1)*c);
					//console.log("r,c to:   " + ((islandSizeRows+1)*(r+1)-1) + "," + ((islandSizeCols+1)*(c+1)-1) );
					//console.log("--------------------------------------------");
					
					//To find previous and next rows of current point
					let prevRow = (islandSizeRows+1)*r;
					let prevCol = (islandSizeCols+1)*c;

					let nextRow = ((islandSizeRows+1)*(r+1)-1);
					let nextCol = ((islandSizeCols+1)*(c+1)-1);

					//To find point even if the map was not sliced evenly
					if(c >= ncols-1){
						nextCol += residueCols;
					}
					if(r >= nrows-1){
						nextRow += residueRows;
					}

					//Localizating current item by looking at previous and next rows and cols
					if( row>=prevRow && row<=nextRow && col>=prevCol  && col<=nextCol ){
						console.log("Found type: " + listOfShapeNames[ historyOfPlacements[i].itemType ] + " in ("+ r +","+c+") island");
						
						//add info on its respective map
						outputData[r][c].itemTypes.push(historyOfPlacements[i].itemType);
						outputData[r][c].itemRotations.push(historyOfPlacements[i].rotation);
						outputData[r][c].positionsX.push(historyOfPlacements[i].positionX);
						outputData[r][c].positionsY.push(historyOfPlacements[i].positionY);
						
					}
				}
			}
		}

		//return outputData;

		//Stringify output of each map
		let outString = "";
		for(var r=0; r<nrows; r++){
			for(var c=0; c<ncols; c++){
				
				//Coordenates are not formated, so extract, reformat and reassign
				let formatedCoordenates = new Vector2Array( outputData[r][c].positionsX, outputData[r][c].positionsY );
				
				//Origin is the top left corner of given [r][c] map
				let originRows = (islandSizeRows+1) * r;
				let originCols = (islandSizeCols+1) * c;
				
				//Reference each points in map from its local origin
				let globalizedCoordenates = GlobalizeCoordenates( formatedCoordenates, -originRows,  -originCols);
				
				//Switch axis from (rwo,col) to (x,y). To rotate all points in a fixed area is needed a reference to the highest point in rows axis, which is size-1
				let rotatedCoordenates = RotatePerfect( globalizedCoordenates, islandSizeRows-1 );

				//Coordenates are formated and sent back to output data
				outputData[r][c].positionsX = rotatedCoordenates.x;
				outputData[r][c].positionsY = rotatedCoordenates.y;

				//Switched map dimentions to match with the (x,y) system
				let mapSizeX = islandSizeCols;
				let mapSizeY = islandSizeRows;

				//If the map was not sliced evenly, compenzate residues in last row and col
				if(c >= ncols-1){
					mapSizeX += residueCols;
				}
				if(r >= nrows-1){
					mapSizeY += residueRows;
				}

				//Apply map size
				outputData[r][c].mapSizeX = mapSizeX;
				outputData[r][c].mapSizeY = mapSizeY;

				//Map name is its position
				outputData[r][c].mapName = "Level " + r + ", " + c;

				//string output and add the separator character
				outString += JSON.stringify( outputData[r][c] );
				outString += "&";
			}
		}

		//Take out last separator character
		outString = outString.slice(0, -1);
		return outString;
	}

	