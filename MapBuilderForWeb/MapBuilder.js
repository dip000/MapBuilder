
        var shapeCoordenates = [];
        function RegisterCoordenatesInMap(x, y){
            if(isPrintAction){
                shapeCoordenates[x+","+y] = {x,y};
            }
            else{
                delete shapeCoordenates[x+","+y]; 
            }
            //console.log(shapeCoordenates);
        }

  
		var occupancyMap;
		const OCCUPIED = true;
		const FREE = false;
		const OUT_OF_BOUNDS = 2;
		const OBSTRUCTED = 3;
		const MAP_CUT = 4;
		function GetOccupancyOfPlacingInfo(){
			//If at least one coordenate is occupied, then return occupied
 			let mapLengthX = occupancyMap.length;
			let mapLengthY = occupancyMap[0].length;
			
			let x = currentItemPlacingInfo.coordenates.x;
			let y = currentItemPlacingInfo.coordenates.y;

			try{
				let state = ( occupancyMap[ currentItemPlacingInfo.positionX ][ currentItemPlacingInfo.positionY ] );
				
				if( state == null){
					return MAP_CUT;
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
		

		
		function UpdateOccupancy(coordenates, state){
			for(var i=0; i<coordenates.x.length; i++){
				occupancyMap[coordenates.x[i]][coordenates.y[i]] = state;
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
		
		function UndoActionFromHistory(itemPlacingInfo){
			if(itemPlacingInfo == null) return;
		
			itemPlacingInfo.deleted = ! (itemPlacingInfo.deleted);
			
			if(itemPlacingInfo.deleted == true){
				return ActionTypes.deleted;
			}
			else{
				return ActionTypes.replaced;
			}
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
				let historyCoordenates = historyOfPlacements[i].coordenates;
				
				for(var j=0; j<historyCoordenates.x.length; j++){
					let sameCoordenateX = (historyCoordenates.x[j] == currentItemPlacingInfo.positionX);
					let sameCoordenateY = (historyCoordenates.y[j] == currentItemPlacingInfo.positionY);
					
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
				let historyCoordenates = historyOfPlacements[i].coordenates;
				
				for(var j=0; j<historyCoordenates.x.length; j++){
					let sameCoordenateX = (historyCoordenates.x[j] == point.x);
					let sameCoordenateY = (historyCoordenates.y[j] == point.y);
					
					if(sameCoordenateX && sameCoordenateY){
						return historyOfPlacements[i];
					}
				}
			}

			return null;
		}



		function IgnoreOccupiedCoordenates(coordenates){
			if(coordenates == null) return null;
			
			newCoordenates = new Vector2Array();
			let j=0;
			let mapLengthX = occupancyMap.length;
			let mapLengthY = occupancyMap[0].length;
			
			for(let i=0; i<coordenates.x.length; i++){
				
				try{
					if(occupancyMap[coordenates.x[i]][coordenates.y[i]] == FREE){
						newCoordenates.x[j] = coordenates.x[i];
						newCoordenates.y[j] = coordenates.y[i];
						j++;
					}
				} catch{}
			}
			
			//console.log(newCoordenates);
			return newCoordenates;
		}
	
//REFORMAT AND OUTPUT ///////////////////////////////////////////////////

		
		function formatCoordenates(){
			
			let outputData = new OutputData();
			outputData.generateFromHistory();
			outputData.generateFromMap();
		
			let formatedCoordenates = new Vector2Array(outputData.positionsX, outputData.positionsY);
			formatedCoordenates = LocalizeCoordenates(formatedCoordenates);
			formatedCoordenates = RotateCoordenates90Clockwise(formatedCoordenates);
			
			outputData.positionsX = formatedCoordenates.x;
			outputData.positionsY = formatedCoordenates.y;
			
			return outputData;
		}
		
		function formatShapes(){
			let output = "";
			for( let i=0; i<listOfShapes.length; i++){
				let shapeFormated = RotateCoordenatesByAngle( listOfShapes[i], -90 );
				
				let outputShape = {
					itemName : listOfShapeNames[i],
					localCoordenatesX : shapeFormated.x,
					localCoordenatesY : shapeFormated.y
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
/////////////////////////////////////////////////////////////////////////


//UNDO MECHANICS  ////////////////////////////////////////////////////////
		/*document.onkeyup = function(e) {
			//Ctrl+Z  is  Undo
			if( e.ctrlKey && e.which == 90 && !e.shiftKey){
				UndoAction(-1);
			}
			//Ctrl+Y  is Redo
			else if( e.ctrlKey && e.which == 89 ){
				UndoAction(1);
			}
			//Ctrl+Shift+Z is Redo as well
			else if( e.ctrlKey && e.shiftKey && e.which == 90 ){
				UndoAction(1);
			}
		};
		
		const ActionTypes = Object.freeze({
		  deleted: 0,
		  replaced: 1
		});
		
		var chainedUndoneIndex = 0;
		function UndoAction(direction){
			//Test input
			let test = chainedUndoneIndex + direction + historyIndex;
			if(test > historyIndex || test < 0 ) return;	
			chainedUndoneIndex += direction;
			//console.log("Undone direction: " + direction + "; undone index: " + chainedUndoneIndex + "; global position: " + (historyIndex + chainedUndoneIndex))
			
			let itemPlacingInfo = GetInformationFromHistoryIndex(historyIndex + chainedUndoneIndex);
			if(itemPlacingInfo == null) return;
			
			let actionResult = UndoActionFromHistory(itemPlacingInfo);
			
			if(actionResult == ActionTypes.deleted){
				printVisualsOfCoordenates(itemPlacingInfo.coordenates, clearedGridColor);
				UpdateOccupancy(itemPlacingInfo.coordenates, FREE);
			}
			else{
				printVisualsOfCoordenates(itemPlacingInfo.coordenates, itemPlacedColor);
				UpdateOccupancy(itemPlacingInfo.coordenates, OCCUPIED);
			}
		}*/
////////////////////////////////////////////////////////////////////////////////////

const keyLog = {}
const handleKeyboard = ({ type, key, repeat, metaKey }) => {
	if (repeat) return

	if (type === 'keydown') {
	keyLog[key] = true

	//Create cuts on rows and cols with Ctrl + arrow keys
	if(keyLog.Control){
		if (key === "ArrowLeft")
			cols(ncols-1);
		if (key === "ArrowRight")
			cols(ncols+1);
		if (key === "ArrowDown")
			rows(nrows-1);
		if (key === "ArrowUp")
			rows(nrows+1);
	}
	else{
		//Rebuild map rows and cols with arrow keys
		if (key === "ArrowLeft")
			map( occupancyMap.length, occupancyMap[0].length-1 );
		if (key === "ArrowRight")
			map( occupancyMap.length, occupancyMap[0].length+1 );
		if (key === "ArrowDown")
			map( occupancyMap.length+1, occupancyMap[0].length );
		if (key === "ArrowUp")
			map( occupancyMap.length-1, occupancyMap[0].length );
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
		//console.error("Constructor of Vector2Array did not found an overload for input");
	}
}

function ItemPlacingInfo(itemType, rotation, positionX, positionY, coordenates){

	if(itemType instanceof ItemPlacingInfo){
		let instance = JSON.parse(JSON.stringify(itemType));
		this.itemType  = instance.itemType;
		this.rotation  = instance.rotation;
		this.positionX = instance.positionX;
		this.positionY = instance.positionY;
		this.coordenates = instance.coordenates;
		this.indexInHistory = instance.indexInHistory;
		this.deleted = instance.deleted;
	}
	else if(itemType == null){
		this.itemType  = 0;
		this.rotation  = 0;
		this.positionX = 0;
		this.positionY = 0;
		this.coordenates = new Vector2Array();
		
		//Internal properties
		this.indexInHistory = 0;
		this.deleted = false;
	}
	else{
		this.itemType  = itemType;
		this.rotation  = rotation;
		this.positionX = positionX;
		this.positionY = positionY;
		this.coordenates = coordenates;
		
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

    this.generateFromHistory = function(){
		let numberOfInstructions = historyOfPlacements.length;
		this.itemTypes = [];
		this.itemRotations = [];
		this.positionsX = [];
		this.positionsY = [];
		
		let j=0;
		
	
		for(var i=0; i<numberOfInstructions; i++){
		
			//Skip the search if it was marked as deleted
			if(historyOfPlacements[i].deleted == true){
				continue;
			}
			
			this.itemTypes[j] = historyOfPlacements[i].itemType;
			this.itemRotations[j] = historyOfPlacements[i].rotation;
			this.positionsX[j] = historyOfPlacements[i].positionX;
			this.positionsY[j] = historyOfPlacements[i].positionY;
			j++;
		}
	}

	this.generateFromMap = function(){
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
	}

	this.addPlacementInfo = function(info){
		this.itemTypes[itemTypes.length] = info.itemType;
		this.itemRotations.push( info.rotation );
		this.positionsX.push( info.positionX );
		this.positionsY.push( info.positionY );
	}
	
}

////////////////////////////////////////////////////////////////////////////////////

/////////////////////////// UPLOAD /////////////////////////////////////////////////

	function upload(uploadString){
		let mapsAndShapesString = uploadString.split("$");
		let mapsString = mapsAndShapesString[0].split("&");
		let shapesString = mapsAndShapesString[1].split("&");

		uploadShapes(shapesString);
		//uploadMaps(mapsString);

		/*console.log(mapsString)
		console.log(shapesString)

		console.log(maps)
		console.log(shapes)*/
	}

	function uploadShapes(shapesString){
		listOfShapes = [];
		let shapes = [];
		for(let i=0; i<shapesString.length; i++){
			shapes[i] = JSON.parse(shapesString[i]);

			let shape = new Vector2Array(shapes[i].localCoordenatesX, shapes[i].localCoordenatesY);
			let shapeRotated = RotateCoordenatesByAngle( shape, 90 );

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
		let mapSize;

		// Simplified version with a non cutted map
		if(mapsString.length == 1){
			rows(1);
			cols(1);

			maps = JSON.parse(mapsString[0]);
			updateMap(maps);
			return;
		}

		// First parse all
		let nmaps = mapsString.length;
		for(let i=0; i<nmaps; i++){
			maps[i] = JSON.parse(mapsString[i]);
		}

		let mapSizeX = maps[0].maps.mapSizeX;
		rows(1);
		cols(1);

	}

	function updateMap(maps){
		map(maps.mapSizeX, maps.mapSizeY);

		for(let i=0; i<maps.positionsX.length; i++){
			ChangeItem(maps.itemTypes[i]);
			currentItemPlacingInfo.rotation = maps.itemRotations[i];
			OnGridClick(maps.positionsX[i], maps.positionsY[i]);
		}
	}



////////////////////////////////////////////////////////////////////////////////////
