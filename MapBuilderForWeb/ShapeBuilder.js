
var shapeMap;
var isShapeEditorActive = false;

		function GoToShapesEditor(){
			HideMapEditor();
			ResetShape();
			//SaveShapeAndContinue();
			
			tableShapes.style.display = "initial";
			let lateralButtons = document.getElementsByClassName("control")[1];
			lateralButtons.style.display = "initial";
			isShapeEditorActive = true;
		}

		function ReturnToMapEditor(){
			let coordenates = OccupancyMapToCoordenates(shapeMap);
			
			if( coordenates.x.length == 0){
				//console.log("There's no shape to save, returning..");
				GoToMapEditor();
				return;
			}
			
			if( confirm("Save Current Shape?") ){
				SaveShape();
			}
			
			GoToMapEditor();
		}
		
		function SaveShapeAndContinue(){
			let inputName = document.getElementById('inputName');

			//Format shape
			let coordenates = OccupancyMapToCoordenates(shapeMap);
			
			if( coordenates.x.length == 0){
				//console.log("There's no shape to save, returning..");
				GoToMapEditor();
				return;
			}
			
			let formatedCoordenates = LocalizeCoordenates(coordenates);
			
			//Add to registry
			//console.log(formatedCoordenates);
			listOfShapes[listOfShapes.length] = formatedCoordenates;
			listOfShapeNames[listOfShapeNames.length] = inputName.value;
			listOfShapeColors[listOfShapeColors.length] = randomColor();
			
			//Reset shapes visuals
			let itemsArea = document.getElementById('itemsArea');
			itemsArea.innerHTML = "";
			
			//Show all current shapes
			initializeMapEditorShapes(listOfShapes.length-1);
		}

		function SaveShape(){
			SaveShapeAndContinue();
			ResetShape();
			//GoToMapEditor();
		}
		
		function OnShapesGridClick(){
			x = currentItemPlacingInfo.positionX;
			y = currentItemPlacingInfo.positionY;
			
			if(GetOccupancyOfShapesEditorCoordenates(x, y) == FREE){
				PlaceDotAtPoint(x, y);	
			}
			else{
				printVisualsOfShapeEditorCoordenates(x, y, clearedGridColor);
				RegisterCoordenatesInShapesMap(x, y, FREE);		
			}
		}
		
		function PlaceDotAtPoint(x, y){
			printVisualsOfShapeEditorCoordenates(x, y, itemPlacedColor);
			RegisterCoordenatesInShapesMap(x, y, OCCUPIED);
		}

		function ResetShape(){
			//console.log("ResetShape stuff happens");
			let formatedCoordenates = OccupancyMapToCoordenates(shapeMap);
			for(let i=0; i<formatedCoordenates.x.length; i++){
				printVisualsOfShapeEditorCoordenates(formatedCoordenates.x[i], formatedCoordenates.y[i], clearedGridColor);
			}
			
			shapeMap = Array(shapesGridSize.x).fill(null).map(()=>Array(shapesGridSize.y).fill(false));
		}

		function RegisterCoordenatesInShapesMap(x, y, state){
			shapeMap[x][y] = state;
		}

		function GetOccupancyOfShapesEditorCoordenates(x, y){
			return shapeMap[x][y];
		}
		
		function HideShapesEditor(){
			tableShapes.style.display = "none";
			let lateralButtons = document.getElementsByClassName("control")[1];
			lateralButtons.style.display = "none";
		}
		
		function GoToMapEditor(){
			HideShapesEditor();
			
			gridMap.style.display = "initial";
			let lateralButtons = document.getElementsByClassName("control")[0];
			lateralButtons.style.display = "initial";
			isShapeEditorActive = false;
		}
		
		function DeleteShape(shapeIndex){

			//Last item cannot be removed
			if(listOfShapes.length <= 1){
				alert("Cannot remove all shapes");
				return;
			}

			//Remove the shape from map
			RemoveShapeFromMap(shapeIndex);

			//Remove and reacomodate registry
			listOfShapes.splice(shapeIndex, 1);
			listOfShapeNames.splice(shapeIndex, 1);
			listOfShapeColors.splice(shapeIndex, 1);
		
			//Reset shapes visuals
			let itemsArea = document.getElementById('itemsArea');
			itemsArea.innerHTML = "";
			
			//Show all current shapes
			initializeMapEditorShapes(0);
		}
		
		
		function RemoveShapeFromMap(shapeIndex){
			
			for(let i=0; i<historyOfPlacements.length; i++){
			
				//Skip the search if it was marked as deleted
				if(historyOfPlacements[i].deleted == true){
					continue;
				}

				let history = historyOfPlacements[i];
				let historyCoordenates = history.coordenates;
				
				//find all matching types
				if(history.itemType == shapeIndex){
					
					//Delete from its level
					let r = history.level.x;
					let c = history.level.y;
					let occupancyMap = occupancyMaps[r][c];
					let level = levels[r][c];

					printVisualsOfCoordenates(historyCoordenates, clearedGridColor, level);
					UpdateOccupancy(historyCoordenates, FREE, occupancyMap);
					
					DeleteFromHistoryOfPlacements( history );
				}
				//Higher item types must reaccomodate. Lower item types stays the same
				else if(history.itemType > shapeIndex){
					history.itemType--;
				}
			}

		}
		