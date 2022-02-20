
        var shapeCoordinates = [];
        function RegisterCoordinatesInMap(x, y){
            if(isPrintAction){
                shapeCoordinates[x+","+y] = {x,y};
            }
            else{
                delete shapeCoordinates[x+","+y]; 
            }
            //console.log(shapeCoordinates);
        }

  
		const OCCUPIED = true;
		const FREE = false;
		const OUT_OF_BOUNDS = 2;
		const OBSTRUCTED = 3;
		const MAP_CUT = 4;
		const NULL = 5;
		function GetOccupancyOfPlacingInfo(){

 			//let mapLengthX = occupancyMap.length;
			//let mapLengthY = occupancyMap[0].length;
			
			let occupancyMap = occupancyMaps[currentItemPlacingInfo.level.x][currentItemPlacingInfo.level.y];

			let x = currentItemPlacingInfo.coordinates.x;
			let y = currentItemPlacingInfo.coordinates.y;

			try{
				let state = ( occupancyMap[ currentItemPlacingInfo.positionX ][ currentItemPlacingInfo.positionY ] );
				
				if( state == null){
					return NULL;
				}
				if( state == OCCUPIED){
					return OCCUPIED;
				}

				for(var i=0; i<x.length; i++){
					state = occupancyMap[ x[i] ][ y[i] ];
					
					if(state == null){
						return OUT_OF_BOUNDS;
					}
					
					if(state == OCCUPIED){
						return OBSTRUCTED;
					}
				}
			} catch {return OUT_OF_BOUNDS;}

			return FREE;
		}
		

		
		function UpdateOccupancy(coordinates, state, map){
			let occupancyMap = map;
			if( occupancyMap == null )
				occupancyMap = occupancyMaps[currentItemPlacingInfo.level.x][currentItemPlacingInfo.level.y];
			
			for(var i=0; i<coordinates.x.length; i++){
				occupancyMap[coordinates.x[i]][coordinates.y[i]] = state;
			}		
		}
		
		var historyOfPlacements = [];
		var historyIndex = 0;
		function RegisterHistoryOfPlacements(itemPlacingInfo){
			itemPlacingInfo.indexInHistory = historyIndex;
			historyOfPlacements[historyIndex++] = new ItemPlacingInfo(itemPlacingInfo);
		}
		
		function DeleteFromHistoryOfPlacements(itemPlacingInfo){
			historyOfPlacements[itemPlacingInfo.indexInHistory].undoFromHistory();
		}
		
		function GetInformationFromHistoryIndex(index){
			if(index < 0) return null;
			if(index > historyOfPlacements.length-1) return null;
			return historyOfPlacements[index];
		}
		
		
		function FindHistoryInfoAtCurrentPlacement(){
			for(var i=0; i<historyOfPlacements.length; i++){
			
				//Skip the search if it was marked as deleted
				if(historyOfPlacements[i].deleted == true){
					continue;
				}
				
				let history = historyOfPlacements[i];
				let historyCoordinates = history.coordinates;
				
				//Skip placement if it happened in a different level
				let differentLevelX = (history.level.x != currentItemPlacingInfo.level.x);
				let differentLevelY = (history.level.y != currentItemPlacingInfo.level.y);
				if( differentLevelX || differentLevelY ){
					continue;
				}
				
				for(var j=0; j<historyCoordinates.x.length; j++){
					let sameCoordenateX = (historyCoordinates.x[j] == currentItemPlacingInfo.positionX);
					let sameCoordenateY = (historyCoordinates.y[j] == currentItemPlacingInfo.positionY);
					if(sameCoordenateX && sameCoordenateY){
						return historyOfPlacements[i];
					}
				}
			}

			return null;
		}
	
		function FindHistoryInfoAtPoint(point){
			for(var i=0; i<historyOfPlacements.length; i++){
			
				//Skip the search if it was marked as deleted
				if(historyOfPlacements[i].deleted == true){
					continue;
				}
				let historyCoordinates = historyOfPlacements[i].coordinates;
				
				for(var j=0; j<historyCoordinates.x.length; j++){
					let sameCoordenateX = (historyCoordinates.x[j] == point.x);
					let sameCoordenateY = (historyCoordinates.y[j] == point.y);
					
					if(sameCoordenateX && sameCoordenateY){
						return historyOfPlacements[i];
					}
				}
			}

			return null;
		}



		function IgnoreOccupiedCoordinates(coordinates, map){
			if(coordinates == null) return null;
			
			newCoordinates = new Vector2Array();
			let j=0;
			
			let occupancyMap = map;
			if( occupancyMap == null )
				occupancyMap = occupancyMaps[currentItemPlacingInfo.level.x][currentItemPlacingInfo.level.y];
			
			for(let i=0; i<coordinates.x.length; i++){
				
				try{
					if(occupancyMap[coordinates.x[i]][coordinates.y[i]] == FREE){
						newCoordinates.x[j] = coordinates.x[i];
						newCoordinates.y[j] = coordinates.y[i];
						j++;
					}
				} catch{}
			}
			
			//console.log(newCoordinates);
			return newCoordinates;
		}
	
//REFORMAT AND OUTPUT ///////////////////////////////////////////////////

		
		function formatCoordinates(){
			
			let outputData = new OutputData();
			outputData.generateFromHistory();
			outputData.generateFromMap(occupancyMaps[currentItemPlacingInfo.level.x][currentItemPlacingInfo.level.y]);
		
			let formatedCoordinates = new Vector2Array(outputData.positionsX, outputData.positionsY);
			formatedCoordinates = LocalizeCoordinates(formatedCoordinates);
			formatedCoordinates = RotateCoordinates90Clockwise(formatedCoordinates);
			
			outputData.positionsX = formatedCoordinates.x;
			outputData.positionsY = formatedCoordinates.y;
			
			return outputData;
		}
		
		function formatShapes(){
			let output = "";
			for( let i=0; i<listOfShapes.length; i++){
				let shapeFormated = RotateCoordinatesByAngle( listOfShapes[i], -90 );
				
				let outputShape = {
					itemName : listOfShapeNames[i],
					localCoordinatesX : shapeFormated.x,
					localCoordinatesY : shapeFormated.y
				};
				output += JSON.stringify(outputShape);
				
				if(i != listOfShapes.length-1)
					output += "&";
			}
			
			return output;
		}

        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
/////////////////////////////////////////////////////////////////////////////////////

/////////// KEY COMBOS //////////////////////////////////////////////////////////////
const keyLog = {}
const handleKeyboard = ({ type, key, repeat, metaKey }) => {
	if( repeat ) return;
	if( isShapeEditorActive ) return;

	if( type === 'keydown' ){
	keyLog[key] = true

	//Create cuts on rows and cols with Ctrl + arrow keys
	if(keyLog.Control){
		if (key === "ArrowLeft")
			cols(gridCols-1);
		if (key === "ArrowRight")
			cols(gridCols+1);
		if (key === "ArrowDown")
			rows(gridRows+1);
		if (key === "ArrowUp")
			rows(gridRows-1);
	}
	else{
		//Rebuild map rows and cols with arrow keys
		if (key === "ArrowLeft")
			map( gridSize.x, gridSize.y-1 );
		if (key === "ArrowRight")
			map( gridSize.x, gridSize.y+1 );
		if (key === "ArrowDown")
			map( gridSize.x+1, gridSize.y );
		if (key === "ArrowUp")
			map( gridSize.x-1,gridSize.y );
	}
}

  // Remove the key from the log on keyup.
  if (type === 'keyup') delete keyLog[key];
}


function initailizeKeyCombos(){
  const events = ['keydown', 'keyup']
  events.forEach(name => document.addEventListener(name, handleKeyboard))

  return () =>
    events.forEach(name => document.removeEventListener(name, handleKeyboard))
}

////////////////////////////////////////////////////////////////////////////////////

// TYPES AND CONSTRUCTORS //////////////////////////////////////////////////////////
function Vector2Array(x, y) {
	//If it is composed of arrayX,arrayY; just assign the values {x,y}
	if( Array.isArray(x) ){
		this.x = x;
		this.y = y;
	}
	//If x was an instance of same type; make a full copy (y input is ignored)
	else if( x instanceof Vector2Array ){
		let instance = JSON.parse(JSON.stringify(x));
		this.x = instance.x;
		this.y = instance.y;
	}
	//If it was an escalar value, start an array at position 0 with {[x],[y]}
	else if( typeof(x) == "number" ){
		this.x = [x];
		this.y = [y];
	}
	//If wrong input, initialize empty array
	else if( x == null ){
		this.x = [];
		this.y = [];
	}
	else{
		console.error("Constructor of Vector2Array did not found an overload for input");
	}
}

function ItemPlacingInfo(itemType, rotation, positionX, positionY, coordinates, level){

	if(itemType instanceof ItemPlacingInfo){
		let instance = JSON.parse(JSON.stringify(itemType));
		this.itemType  = instance.itemType;
		this.rotation  = instance.rotation;
		this.positionX = instance.positionX;
		this.positionY = instance.positionY;
		this.coordinates = instance.coordinates;
		this.indexInHistory = instance.indexInHistory;
		this.deleted = instance.deleted;
		this.level = instance.level;
	}
	else if(itemType == null){
		this.itemType  = 0;
		this.rotation  = 0;
		this.positionX = 0;
		this.positionY = 0;
		this.coordinates = new Vector2Array();
		this.level = new Point();
	
		//Internal properties
		this.indexInHistory = 0;
		this.deleted = false;
	}
	else{
		this.itemType  = itemType;
		this.rotation  = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
		this.coordinates = coordinates;
		this.level = level;
		
		//Internal properties
		this.indexInHistory = 0;
		this.deleted = false;
	}
	
	this.undoFromHistory = function(){this.deleted=true;}
	
}

function OutputData(){
	this.itemTypes = new Array();
	this.itemRotations = new Array();
	this.positionsX = new Array();
	this.positionsY = new Array();
	this.mapSizeX = 0;
	this.mapSizeY = 0;
	this.mapName = "unnamed";
	this.parseInfo = {originalSize:null, originalOffset:null, level:null, rows:null, cols:null};

    this.generateFromHistory = function( history=historyOfPlacements ){
		
		let numberOfInstructions = history.length;
		this.itemTypes = [];
		this.itemRotations = [];
		this.positionsX = [];
		this.positionsY = [];
		
		let j=0;
	
		for(var i=0; i<numberOfInstructions; i++){
		
			//Skip the search if it was marked as deleted
			if(history[i].deleted == true){
				continue;
			}
			
			this.itemTypes[j] = history[i].itemType;
			this.itemRotations[j] = history[i].rotation;
			this.positionsX[j] = history[i].positionX;
			this.positionsY[j] = history[i].positionY;
			j++;
		}
	}

	this.generateFromMap = function(occupancyMap){
		let mapLengthX = occupancyMap.length;
		let mapLengthY = occupancyMap[0].length;
		let minX = 999;
		let minY = 999;
		let maxX = 0;
		let maxY = 0;

		for(let i=0; i<mapLengthX; i++){
			for(var j=0; j<mapLengthY; j++){
				if( occupancyMap[i][j] == OCCUPIED){
					if(i < minX){
						minX = i;
					}
					if(i > maxX){
						maxX = i;
					}

					if(j < minY){
						minY = j;
					}
					if(j > maxY){
						maxY = j;
					}
				}
			}
		}

		this.mapSizeX = maxY - minY + 1;
		this.mapSizeY = maxX - minX + 1;
		
		return {"minX":minX, "maxX":maxX, "minY":minY, "maxY":maxY};
	}

	
}

function Point(x, y){
	this.x = x;
	this.y = y;
}

////////////////////////////////////////////////////////////////////////////////////

/////////////////////////// UPLOAD /////////////////////////////////////////////////

	function upload(uploadString){
		let mapsAndShapesString = uploadString.split("$");
		let mapsString = mapsAndShapesString[0].split("&");
		let shapesString = mapsAndShapesString[1].split("&");

		uploadShapes(shapesString);
		uploadMaps(mapsString);
		ChangeItem(0);
	}

	function uploadShapes(shapesString){
		listOfShapes = [];
		let shapes = [];
		for(let i=0; i<shapesString.length; i++){
			shapes[i] = JSON.parse(shapesString[i]);

			let shape = new Vector2Array(shapes[i].localCoordinatesX, shapes[i].localCoordinatesY);
			let shapeRotated = RotateCoordinatesByAngle( shape, 90 );

			listOfShapes[i] = shapeRotated;
			listOfShapeNames[i] = shapes[i].itemName;
			listOfShapeColors[i] = randomColor();
		}

		//Reset shapes visuals
		let itemsArea = document.getElementById('itemsArea');
		itemsArea.innerHTML = "";
		
		//Show all current shapes
		initializeMapEditorShapes(listOfShapes.length-1);

	}

	function uploadMaps(mapsString){

		let maps = [];
		maps[0] = JSON.parse(mapsString[0]);

		//Rebuild from parseInfo data
		let newMapSizeX = maps[0].parseInfo.originalSize.x;
		let newMapSizeY = maps[0].parseInfo.originalSize.y;
		let nrows = maps[0].parseInfo.rows;
		let ncols = maps[0].parseInfo.cols;

		MapRowCols(newMapSizeX, newMapSizeY, nrows, ncols);
		updateMap(maps[0]);

		//Build each map
		for(let i=1; i<mapsString.length; i++){
			maps[i] = JSON.parse(mapsString[i]);
			updateMap(maps[i]);
		}


	}

	function updateMap(maps){	
		//Rebuild from parseInfo data
		currentItemPlacingInfo.level = maps.parseInfo.level;

		let placementOffset = new Point(0,0);
		if( maps.parseInfo.originalOffset != null ){
			placementOffset.x = maps.parseInfo.originalOffset.minX;
			placementOffset.y = maps.parseInfo.originalOffset.minY;
		}

		for(let i=0; i<maps.positionsX.length; i++){

			currentItemPlacingInfo.rotation = maps.itemRotations[i];
			currentItemPlacingInfo.itemType = maps.itemTypes[i];

			let itemType = maps.itemTypes[i];
			let itemShape = listOfShapes[itemType];
			let shapeRotated = RotateCoordinatesByAngle(itemShape, currentItemPlacingInfo.rotation);

			//Performs a global rotation. Switches axis and mirrors Y
			currentItemPlacingInfo.positionX = (maps.mapSizeY-1) - maps.positionsY[i] + placementOffset.x;
			currentItemPlacingInfo.positionY = maps.positionsX[i] + placementOffset.y;

			let pivot = GetMinValuesOfCoordinates(shapeRotated);
			let coordinates = GlobalizeCoordinates(shapeRotated, currentItemPlacingInfo.positionX - pivot.x, currentItemPlacingInfo.positionY - pivot.y);
			currentItemPlacingInfo.coordinates = coordinates;

			//console.log( new ItemPlacingInfo(currentItemPlacingInfo) )
			printVisualsOfCoordinates(coordinates, listOfShapeColors[ maps.itemTypes[i] ]);
			UpdateOccupancy(coordinates, OCCUPIED);
			RegisterHistoryOfPlacements(currentItemPlacingInfo);
		}
	}



////////////////////////////////////////////////////////////////////////////////////
