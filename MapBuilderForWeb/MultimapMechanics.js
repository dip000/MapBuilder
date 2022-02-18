

	function resetMap(){
		if( AskForReset() == DONT_RESET ) return;

		if(gridMap != null){
			document.getElementById("GridGraphics").removeChild(gridMap);
			gridMap = null;
		}
	}

	function map(x, y){
		resetMap()

		gridSize.x =  Math.max(1, x);
		gridSize.y =  Math.max(1, y);
		initializeMapEditorGrid( gridSize.x, gridSize.y );
	}
	
	function rows(nrows){
		gridRows = Math.max(1, nrows);
		map(gridSize.x, gridSize.y);
	}
	 
	function cols(ncols){
		gridCols = Math.max(1, ncols);
		map(gridSize.x, gridSize.y);
	}

	const RESET = true;
	const DONT_RESET = false;
	function AskForReset(message=""){
		for(let r=0; r<occupancyMaps.length; r++){
			for(let c=0; c<occupancyMaps[0].length; c++){
				let coordenates = OccupancyMapToCoordenates(occupancyMaps[r][c]);
				if( coordenates.x.length != 0 && (confirm(message + " Requires a reset. Continue?") == false) ){
					return DONT_RESET;
				}
			}
		}
		return RESET;
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

	