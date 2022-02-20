

// LISTENERS //////////////////////////////////////////////////////////////////////

	var previusCoordinates;
	let value = "646970303030";
	var isClicking = false;
	
	function AddHoverListenerToElements(elements, callback){
		for(let i=0; i<elements.length; i++){
			elements[i].addEventListener('mouseenter', function(e){
				currentItemPlacingInfo.positionX = e.target.parentElement.rowIndex;
				currentItemPlacingInfo.positionY = e.target.cellIndex;
				currentItemPlacingInfo.level = callback();
								
				positionX.innerHTML = currentItemPlacingInfo.positionX;
				positionY.innerHTML = currentItemPlacingInfo.positionY;
				levelElement.innerHTML = currentItemPlacingInfo.level.x + ", " + currentItemPlacingInfo.level.y;

				

				printHoverVisuals();
				printHoverShapeVisuals();
				
				//If user is clicking, act hovering as clicking constantly
				if(isClicking){
					if(isShapeEditorActive)
						PlaceDotAtPoint(currentItemPlacingInfo.positionX, currentItemPlacingInfo.positionY);
					else{
						OnGridClickAndDrag();
					}
				}
				
				
			
			}, false);
		}
	}
	
	function AddClickListenerToElement(element, callback){
		element.addEventListener('mousedown', function(e) {
			topValue.innerHTML = getStatisticsTopValue(value);
			currentItemPlacingInfo.positionX = e.target.parentElement.rowIndex;
			currentItemPlacingInfo.positionY = e.target.cellIndex;
			
			isClicking = true;

			if(currentItemPlacingInfo.positionX == null || currentItemPlacingInfo.positionY == null) return;
			
			callback();
			//console.log( new ItemPlacingInfo(currentItemPlacingInfo) );
		   
		}, false);     
	}
	
	function AddListenerToScrollWheel(item){
		item.addEventListener("wheel", function(e) {
			e.preventDefault();
			
			let rot = 90;
			if( e.deltaY < 0){
				rot = -90;
			}
			
			//console.log("SCROLL EVENT. rotation to: " + rot);
			//console.log(currentItemPlacingInfo);
			currentItemPlacingInfo.rotation = (rot+currentItemPlacingInfo.rotation)%360;
			
			rotation.innerHTML = currentItemPlacingInfo.rotation;
			
			printHoverVisuals();
		});
	}
	
////////////////////////////////////////////////////////////////////////////////////
	
	
// PRINTERS ////////////////////////////////////////////////////////////////////////
		
	var previousLevel;
	var previousMap;
	
	function printHoverVisuals(){		
		//Read all from current placing info
		let shape = listOfShapes[currentItemPlacingInfo.itemType];
		let shapeRotated = RotateCoordinatesByAngle(shape, currentItemPlacingInfo.rotation);

		//Reformat to volume average
		let averageVolume = AverageVolume(shapeRotated);
		let roundedAverageVolume = { x:Math.round(averageVolume.x), y:Math.round(averageVolume.y) };
		let volumeIndex = { x:(currentItemPlacingInfo.positionX-roundedAverageVolume.x), y:(currentItemPlacingInfo.positionY - roundedAverageVolume.y) };

		let coordinates = GlobalizeCoordinates(shapeRotated, volumeIndex.x, volumeIndex.y);
				
		coordinates = IgnoreOccupiedCoordinates(coordinates);
		previusCoordinates = IgnoreOccupiedCoordinates(previusCoordinates, previousMap);
		
		//console.log(new Vector2Array(coordinates));

		printVisualsOfCoordinates( previusCoordinates , clearedGridColor, previousLevel );
		printVisualsOfCoordinates( coordinates, itemShadowColor );
		
		previusCoordinates = coordinates;
		previousLevel = levels[ currentItemPlacingInfo.level.x ][ currentItemPlacingInfo.level.y ];
		previousMap = occupancyMaps[ currentItemPlacingInfo.level.x ][ currentItemPlacingInfo.level.y ];
	}
	
	var _x=0, _y=0;
	function printHoverShapeVisuals(){
		try{
				
			if(GetOccupancyOfShapesEditorCoordinates(_x, _y) == FREE){
				let _cell = tableShapes.rows[ _x ].cells[ _y ];
				if(_cell == null) return;
				_cell.style.backgroundColor = clearedGridColor;
			}
			
			if(GetOccupancyOfShapesEditorCoordinates(currentItemPlacingInfo.positionX, currentItemPlacingInfo.positionY) == FREE){
				let cell = tableShapes.rows[ currentItemPlacingInfo.positionX ].cells[ currentItemPlacingInfo.positionY ];
				if(cell == null) return;
				cell.style.backgroundColor = itemShadowColor;	
			}
			
			_x=currentItemPlacingInfo.positionX;
			_y=currentItemPlacingInfo.positionY;
		}catch{}
	}
	
	function printVisualsOfCoordinates(shape, color, level){
		if(shape==null) return;

		if(level == null)
			level = levels[currentItemPlacingInfo.level.x][currentItemPlacingInfo.level.y];
		//console.log( shape );

		for(var i=0; i<shape.x.length; i++){
			var cell = level.rows[ shape.x[i] ].cells[ shape.y[i] ];
			if(cell == null) continue;
			
			cell.style.backgroundColor = color;	
		}
	}
	
	function printVisualsOfShapeEditorCoordinates(x, y, color){
		var cell = tableShapes.rows[ x ].cells[ y ];
		cell.style.backgroundColor = color;	
	}
	
	function printVisualsOfCoordinatesOnTable(shape, color, table){
		if(shape==null) return;
		for(var i=0; i<shape.x.length; i++){
			var cell = table.rows[ shape.x[i] ].cells[ shape.y[i] ];
			cell.style.backgroundColor = color;	
		}
	}
	
	
	
	var isPrintAction = true;
	function ToggleDotInCoordenate(x, y){
		var cell = table.rows[x].cells[y];
		var cellColor = cell.style.backgroundColor

		if(cellColor == "red"){
			cell.style.backgroundColor = clearedGridColor;
			isPrintAction = false;
		}
		else{
			cell.style.backgroundColor = "red";
			isPrintAction = true;
		}
	}
	


////////////////////////////////////////////////////////////////////////////////////


// TYPES AND CONSTRUCTORS //////////////////////////////////////////////////////////

	function generate_table(x, y, padding=10) {
		// get the reference for the body
		var body = document.getElementsByTagName("body")[0];

		// creates a <table> element and a <tbody> element
		var tbl = document.createElement("table");
		var tblBody = document.createElement("tbody");

		// creating all cells
		for (var i = 0; i < x; i++) {
			// creates a table row
			var row = document.createElement("tr");

			for (var j = 0; j < y; j++) {
				// Create a <td> element and a text node, make the text
				// node the contents of the <td>, and put the <td> at
				// the end of the table row
				var cell = document.createElement("td");
				var cellText = document.createTextNode("  ");
				cell.appendChild(cellText);
				row.appendChild(cell);
				cell.style.padding = padding + "px";
			}

			// add the row to the end of the table body
			tblBody.appendChild(row);
		}
		
		// put the <tbody> in the <table> and appends into <body>
		tbl.appendChild(tblBody);
		body.appendChild(tbl);
		//tbl.setAttribute("border", "2");
		
		return tbl;
	}
	

	
////////////////////////////////////////////////////////////////////////////////////