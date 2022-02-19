

	function clearMap(){
		if( AskForReset() == DONT_RESET ) return;

		ResetMap();
		if(gridMap != null){
			document.getElementById("GridGraphics").removeChild(gridMap);
			gridMap = null;
		}
		//console.log("clearMap");
	}

	function map(x, y){
		clearMap();

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

	function MapRowCols(x, y, nrows, ncols){
		clearMap();

		gridCols = Math.max(1, ncols);
		gridRows = Math.max(1, nrows);
		gridSize.x =  Math.max(1, x);
		gridSize.y =  Math.max(1, y);
		initializeMapEditorGrid( gridSize.x, gridSize.y );
	}

	const RESET = true;
	const DONT_RESET = false;
	function AskForReset(message=""){
		/*for(let r=0; r<occupancyMaps.length; r++){
			for(let c=0; c<occupancyMaps[0].length; c++){
				
				let coordenates = OccupancyMapToCoordenates(occupancyMaps[r][c]);
				if( coordenates == null)
					continue;
				
				if( coordenates.x.length != 0 && (confirm(message + " Requires a reset. Continue?") == false) ){
					return DONT_RESET;
				}
			}
		}*/
		//console.log("AskForReset");
		return RESET;
	}

	
	const AUTO_LOC = 0;
	const ALWAYS_LOC = 1;
	const NEVER_LOC = 2;
	var localizeOutput = AUTO_LOC;
	
	function formatHistoryData(){
		//Localize if there's only one map in auto mode
		let localize;
		switch(localizeOutput){
			case AUTO_LOC:  localize = (gridRows==1 && gridCols == 1); break;
			case ALWAYS_LOC: localize = true; break;
			case NEVER_LOC: localize = false; break;
		}
		
	
		const numberOfInstructions = historyOfPlacements.length;
		let outputData = new Array();
		
		// Get all data from history
		for(var i=0; i<numberOfInstructions; i++){
		
			//Skip the search if it was marked as deleted
			if(historyOfPlacements[i].deleted == true){
				continue;
			}
			
			//In which level was this item placed
			let r = historyOfPlacements[i].level.x;
			let c = historyOfPlacements[i].level.y;
			
			//Make all levels that has an item in history
			if(outputData[r] == null){
				outputData[r] = new Array();
			}
			if(outputData[r][c] == null){
				outputData[r][c] = new OutputData();
			}
			
			//add info on its respective map
			outputData[r][c].itemTypes.push(historyOfPlacements[i].itemType);
			outputData[r][c].itemRotations.push(historyOfPlacements[i].rotation);
			outputData[r][c].positionsX.push(historyOfPlacements[i].positionX);
			outputData[r][c].positionsY.push(historyOfPlacements[i].positionY);
		}
		
		//return outputData;
		
		//Format coordenates and stringify each level
		let outString = "";
		for(var r=0; r<gridRows; r++){
			for(var c=0; c<gridCols; c++){
				
				//Skip empty maps
				if(outputData[r] == null) continue;
				
				//Coordenates are not formated, so extract, reformat and reassign
				let formatedCoordenates = new Vector2Array( outputData[r][c].positionsX, outputData[r][c].positionsY );
				
				//Localized coordenates are just the minimum size in which the whole level fits
				let rotatedCoordenates;
				let residueData;
				if(localize){
					residueData = outputData[r][c].generateFromMap( occupancyMaps[r][c] );
					
					//Rotates in local space
					rotatedCoordenates = LocalizeCoordenates(formatedCoordenates);
					rotatedCoordenates = RotateCoordenates90Clockwise(rotatedCoordenates);
				}
				else{
					//Switch axis from (rwo,col) to (x,y). To rotate all points in a fixed area is needed a reference to the highest point in rows axis, which is size-1
					rotatedCoordenates = RotatePerfect( formatedCoordenates, gridSize.x-1 );
					
					//Switched map dimentions to match with the (x,y) system
					outputData[r][c].mapSizeX = gridSize.y;
					outputData[r][c].mapSizeY = gridSize.x;
				}

				//Data that can be used to upload and rebuild the session
				outputData[r][c].parseInfo.originalSize = gridSize;
				outputData[r][c].parseInfo.originalOffset = residueData;
				outputData[r][c].parseInfo.level = new Point(r,c);
				outputData[r][c].parseInfo.rows = gridRows;
				outputData[r][c].parseInfo.cols = gridCols;

				//Coordenates are formated and sent back to output data
				outputData[r][c].positionsX = rotatedCoordenates.x;
				outputData[r][c].positionsY = rotatedCoordenates.y;


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




