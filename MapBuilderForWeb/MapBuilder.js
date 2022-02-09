
        var shapeCoordenates = [];
        function RegisterCoordenatesInMap(x, y){
            if(isPrintAction){
                shapeCoordenates[x+","+y] = {x,y};
            }
            else{
                delete shapeCoordenates[x+","+y]; 
            }
            console.log(shapeCoordenates);
        }

  
		var occupancyMap;
		const OCCUPIED = true;
		const FREE = false;
		function GetOccupancyOfCoordenates(coordenates){
			//If at least one coordenate is occupied, then return occupied
			try{
				for(var i=0; i<coordenates.x.length; i++){
					if(occupancyMap[coordenates.x[i]][coordenates.y[i]] == OCCUPIED){
						console.log("Coordenates are occupied:");
						console.log(coordenates);
						return OCCUPIED;
					}
				}
			} catch {return OCCUPIED;}
			console.log("Coordenates are unoccupied:");
			console.log(coordenates);
			return FREE;
		}
		

		
		function UpdateOccupancy(coordenates, OCCUPIED){
            for(var i=0; i<coordenates.x.length; i++){
				occupancyMap[coordenates.x[i]][coordenates.y[i]] = OCCUPIED;
			}
			
			console.log("UPDATED OCCUPANCY MAP:");
			console.log(occupancyMap);
		}
		
		var historyOfPlacements = [];
		var historyIndex = 0;
		function RegisterHistoryOfPlacements(itemPlacingInfo){
			itemPlacingInfo.indexInHistory = historyIndex;
			historyOfPlacements[historyIndex++] = new ItemPlacingInfo(itemPlacingInfo);
			console.log("Registered in history. History:");
			console.log(historyOfPlacements);
		}
		
		function DeleteFromHistoryOfPlacements(itemPlacingInfo){
			historyOfPlacements[itemPlacingInfo.indexInHistory].undoFromHistory();
			console.log("Undone from history. History:");
			console.log(historyOfPlacements);
		}
		
		function UndoActionFromHistory(itemPlacingInfo){
			if(itemPlacingInfo == null) return;
		
			itemPlacingInfo.deleted = ! (itemPlacingInfo.deleted);
			console.log("Undone Last action from history. History:");
			console.log(historyOfPlacements);
			
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
		
		
		function FindHistoryInfoAtCoordenates(coordenate){
			for(var i=0; i<historyOfPlacements.length; i++){
			
				//Skip the search if it was marked as deleted
				if(historyOfPlacements[i].deleted == true){
					continue;
				}
				
				let historyCoordenates = historyOfPlacements[i].coordenates;
				
				for(var j=0; j<historyCoordenates.x.length; j++){
					let sameCoordenateX = (historyCoordenates.x[j] == coordenate.x[0]);
					let sameCoordenateY = (historyCoordenates.y[j] == coordenate.y[0]);
					
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
		document.onkeyup = function(e) {
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
			console.log("Undone direction: " + direction + "; undone index: " + chainedUndoneIndex + "; global position: " + (historyIndex + chainedUndoneIndex))
			
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
	this.itemTypes;
	this.itemRotations;
	this.positionsX;
	this.positionsY;
	this.mapSizeX;
	this.mapSizeY;

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
}

////////////////////////////////////////////////////////////////////////////////////
