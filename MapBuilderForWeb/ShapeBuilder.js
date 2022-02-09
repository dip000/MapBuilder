
var shapeMap;

		function GoToShapesEditor(){
			HideMapEditor();
			ResetShape();
			//SaveShapeAndContinue();
			
			tableShapes.style.display = "initial";
			let lateralButtons = document.getElementsByClassName("control")[1];
			lateralButtons.style.display = "initial";
		}

		function ReturnToMapEditor(){
			let coordenates = OccupancyMapToCoordenates(shapeMap);
			
			if( coordenates.x.length == 0){
				console.log("There's no shape to save, returning..");
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
				console.log("There's no shape to save, returning..");
				GoToMapEditor();
				return;
			}
			
			let formatedCoordenates = LocalizeCoordenates(coordenates);
			
			//Add to registry
			console.log(formatedCoordenates);
			listOfShapes[listOfShapes.length] = formatedCoordenates;
			listOfShapeNames[listOfShapeNames.length] = inputName.value;
			
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

		function OnShapesGridClick(x, y){
			console.log("OnShapesGridClick stuff happens");
			
			if(GetOccupancyOfShapesEditorCoordenates(x, y) == FREE){
				printVisualsOfShapeEditorCoordenates(x, y, itemPlacedColor);
				RegisterCoordenatesInShapesMap(x, y, OCCUPIED);
			}
			else{
				printVisualsOfShapeEditorCoordenates(x, y, clearedGridColor);
				RegisterCoordenatesInShapesMap(x, y, FREE);		
			}
		}

		function ResetShape(){
			console.log("ResetShape stuff happens");
			let formatedCoordenates = OccupancyMapToCoordenates(shapeMap);
			for(let i=0; i<formatedCoordenates.x.length; i++){
				printVisualsOfShapeEditorCoordenates(formatedCoordenates.x[i], formatedCoordenates.y[i], clearedGridColor);
			}
			
			let mapLengthX = occupancyMap.length;
			let mapLengthY = occupancyMap[0].length;
			
			shapeMap = Array(mapLengthX).fill(null).map(()=>Array(mapLengthY).fill(false));
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
			
			table.style.display = "initial";
			let lateralButtons = document.getElementsByClassName("control")[0];
			lateralButtons.style.display = "initial";
		}