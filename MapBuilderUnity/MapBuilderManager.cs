using System.Collections.Generic;
using UnityEngine;


[ExecuteInEditMode]
public class MapBuilderManager : MonoBehaviour
{
	[Header("Leave empty to use placeholders")]
	public Shapes[] items = new Shapes[0];
	public Map[] levels;

	[Header("Settings")]
	public TextAsset configurationsFile;
    [HideInInspector] public TextAsset previousConfigurationsFile;

	public float gridScale = 1;

	[Header("Check to see the grid")]
	public bool showDebugs = true;

	public int currentLevel { get; private set; }

	//[MapIndex][itemInstanceIndex]
	GameObject[][] itemInstances;
	List<GameObject> placeHoldersInstances = new List<GameObject>();


	/////////////////////////// MANAGING //////////////////////////////////////////
	
	public void BuildLevel( int level )
	{
		if( SeccurityChecks() == false ) return;
		
		currentLevel = Mathf.Clamp( level, 0, Mathf.Max( 0, levels.Length - 1 ) );
		
		DestroyLevel( currentLevel );
		
		//Make placeholders if is needed. References are saved in placeHoldersInstances
		MakePlaceHolders( currentLevel );
		PlaceItems( currentLevel );
		//DestroyPlaceHolders( placeHoldersInstances );
	}
	
	public void DestroyLevel( int level ){

		if( SeccurityChecks() == false ) return;
		try{ if( itemInstances[level].Length == 0 ) return; } catch{ return;}
				
		currentLevel = Mathf.Clamp( level, 0, Mathf.Max( 0, levels.Length - 1 ) );

        for(int i=0; i< itemInstances[currentLevel].Length; i++ ){
			DestroyImmediate( itemInstances[currentLevel][i] );
		}
	}
	
	[ContextMenu("BuildAllLevels")]
	public void BuildAllLevels(){
				
		if( SeccurityChecks() == false ) return;

		for( currentLevel=0; currentLevel<levels.Length; currentLevel++ ){
			BuildLevel( currentLevel );
		}
		
		Debuger( "Built " + levels.Length + " levels");
	}
	
	[ContextMenu("DestroyAllLevels")]
	public void DestroyAllLevels(){
		if( SeccurityChecks() == false ) return;
		try{ if( itemInstances[0].Length == 0 ) return; } catch{ return;}
	
		var itemsCounter = 0;
		
		for( currentLevel=0; currentLevel<levels.Length; currentLevel++ ){
			var currentItems = itemInstances[currentLevel];
			
			for(int j=0; j< currentItems.Length; j++ ){
				DestroyImmediate( currentItems[j] );
			}
			
			itemsCounter += currentItems.Length;
		}
		
		DestroyPlaceHolders( placeHoldersInstances.ToArray() );
		placeHoldersInstances.Clear();
		
		Debuger( "Destroyed " + levels.Length + " Levels and " + placeHoldersInstances.Count + " placeholders. A total of " + itemsCounter + " Shapes" );
	}
	

////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////// ITEMS PLACER LOGIC ////////////////////////////

	void SerializeConfigurations()
    {
		//Configuration file syntax is {map1Info}&{mapXInfo}${item1Info}&{itemXInfo}
		string[] parsedFiles = configurationsFile.text.Split('$');
        string[] mapInfo = parsedFiles[0].Split('&');
        string[] itemInfo = parsedFiles[1].Split('&');
		int numberOfItems = itemInfo.Length;
		int numberOfMaps = mapInfo.Length;

		//Serialize Map info:
		// 1. Creates in a temporal instance to serialize and place user holders
		Map[] tempMaps = new Map[numberOfMaps];
		for( int i = 0; i < numberOfMaps; i++ ) { 
			tempMaps[i] = Map.CreateFromJSON( mapInfo[i] );

			// 2. Cut all holders that desn't fit anymore
			if( i < levels.Length )
				tempMaps[i].mapHolder = levels[i].mapHolder;
		}
		// 3. Return contents original instance
		levels = tempMaps;

		//Serialize Shapes info. Same as levels
		Shapes[] tempItems = new Shapes[numberOfItems];
        for (int i = 0; i < numberOfItems; i++)
        {
            tempItems[i] = Shapes.CreateFromJSON( itemInfo[i] );

			if (i < items.Length)
				tempItems[i].graphics = items[i].graphics;
		}
		items = tempItems;
    }
	
	public void PlaceItems(int level){
		
		Map currentMap = levels[level];
		Transform mapHolder = currentMap.mapHolder;
		
		//Fill ItemInstances of the current map
		itemInstances[level] = new GameObject[currentMap.itemTypes.Length];
		
		for (int i=0; i<currentMap.itemTypes.Length; i++){
			var itemType = currentMap.itemTypes[i];
			var item = items[ itemType ];
			
			//Vectorize to work with a standarized format
			Vector2[] itemShape = Vector2Calculations.VectorizeComponents(item.localCoordinatesX, item.localCoordinatesY);
			Vector2 itemPosition = new Vector2(currentMap.positionsX[i], currentMap.positionsY[i]);
			
			//Rotate and Globalize coordinates
			Vector2[] itemShapeRotated = Vector2Calculations.RotateMatrixAngle(itemShape, currentMap.itemRotations[i]);
			Vector2[] globalCoordinates = Vector2Calculations.Globalize(itemShapeRotated, itemPosition);

			//Find world space position to place the item
			Vector3 worldSpacePosition = Vector2Calculations.GridSpacePosition( itemShapeRotated, itemPosition, gridScale ) + mapHolder.position;

			//Apply transforms and properties
			//NOTE: Damn rotation is inverted natively, it rotates clockwise on positive angles. So 360-angle rotates correctly
			GameObject itemInstance = Instantiate(item.graphics, worldSpacePosition, Quaternion.Euler(0, 360 - currentMap.itemRotations[i], 0) );
			itemInstance.name = item.itemName;
			itemInstance.transform.parent = mapHolder;

			//Save as a reference
			itemInstances[level][i] = itemInstance;
		}

		Debuger("Level " + level + " placed " + currentMap.itemTypes.Length + " Shapes");
	}
	
		
	void MakePlaceHolders( int level ){
		Map currentMap = levels[level];
		Transform mapHolder = currentMap.mapHolder;
		
		//Placeholders for mapHolder stay assigned and doesn't get destroyed on "Update Map"
		if( mapHolder == null ){
			mapHolder = (new GameObject( currentMap.mapName )).transform;
			mapHolder.parent = transform;
			mapHolder.position = GetPositionOfLevel( level ) + transform.position;
			currentMap.mapHolder = mapHolder;
			placeHoldersInstances.Add( mapHolder.gameObject );
		}
		
		//Placeholders for item graphics stay assigned and doesn't get destroyed on "Update Map"
		var separation = new Vector3(0, 0.2f, 0);
		for( int i=0; i<currentMap.itemTypes.Length; i++ ){
			var itemType = currentMap.itemTypes[i];
			var item = items[ itemType ];

			if( item.graphics == null ){
				//Make a placeholder that has the exact appearance as the item shape
				var shape = Vector2Calculations.VectorizeComponents( item.localCoordinatesX, item.localCoordinatesY );
				var shapeInstance = ShapeBuilder( shape );
				
				//Apply transforms and properties
				shapeInstance.name = "PrefabPlaceholder " + item.itemName;
				shapeInstance.transform.position = separation * i + transform.position;
				
				//Assign and save reference
				item.graphics = shapeInstance;
				placeHoldersInstances.Add( shapeInstance );
			}
		}
	}
	
	Vector3 GetPositionOfLevel(int level){
		Map currentMap = levels[level];
		
		var positionSubstrings = currentMap.mapName.Split( new char[]{' ',','} );
		var gridSpacePosition = new Vector3( currentMap.mapSizeX * int.Parse(positionSubstrings[1]), 0, currentMap.mapSizeX * int.Parse(positionSubstrings[2]) ) * gridScale;
		
		return gridSpacePosition;
	}
	
	void DestroyPlaceHolders( GameObject[] placeHolders ){
		//Delete used Place Holders
		foreach(var placeHolder in placeHolders)
			DestroyImmediate(placeHolder);	
	}
	
	GameObject ShapeBuilder( Vector2[] shape ){
		
		var shapeCenter = Vector2Calculations.BoundingBoxCenterOfCoordinates( shape );
		var itemScale = new Vector3( gridScale, 0.1f, gridScale );
		var shapeParent = new GameObject("CreatedShape");

		for( int j = 0; j < shape.Length; j++ )
		{
			// 1. We're printing cell by cell the object shape made of 'shape.Length' squares
			// 2. shapeCenter is the bounding box center of all the squares that compose the whole shape
			var previousCenter = shape[j];
			var newCenter = (previousCenter - shapeCenter) * gridScale;
			var newCenterGlobalized = new Vector3( newCenter.x, 0, newCenter.y );

			//Gizmos.DrawCube( newCenterGlobalized, itemScale );
			var instance = GameObject.CreatePrimitive(PrimitiveType.Cube);
			instance.transform.position = newCenterGlobalized;
			instance.transform.localScale = itemScale;
			instance.transform.parent = shapeParent.transform;
			instance.name = "ShapeComponent" + j;
		}
		
		return shapeParent;
	}
	
	//Since it sxecutes in edit mode, this triggers on script placement or gameobject duplication
	void OnEnable()
    {
        if( configurationsFile == null ) return;
		if( levels == null ) return;
		
		SerializeConfigurations();
		itemInstances = new GameObject[levels.Length][];
		Debuger("Serialized an updated");
	}

	private void OnValidate()
	{
		//If user inputed a configurations file. Serialize configurations so user can
		//place the graphics and holders in its corresponding places
		if( configurationsFile == previousConfigurationsFile) return;
        previousConfigurationsFile = configurationsFile;

        if( configurationsFile == null ) return;
        if( Application.isPlaying ) return;

		//Update configurations and initialize the instance sizes
		SerializeConfigurations();
		itemInstances = new GameObject[levels.Length][];
        Debuger("Serialized configurations");
	}
	
	bool SeccurityChecks(){
 		if(configurationsFile == null){
			Debug.LogWarning("No Configurations File. Head to: https://dip000.github.io/MapBuilder/MapBuilderForWeb/MapBuilderForWeb.html To make your map");
			return false;
        }
		if( levels == null ){
			Debug.LogWarning("No Map to build. Head to: https://dip000.github.io/MapBuilder/MapBuilderForWeb/MapBuilderForWeb.html To make your map");
			return false;
        }
		
		return true;
	}	
////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////// CLASSES /////////////////////////////////

	[System.Serializable]
	public class Shapes {
		[HideInInspector] public string itemName;
		public GameObject graphics;

		[HideInInspector] public float[] localCoordinatesX;
		[HideInInspector] public float[] localCoordinatesY;

		public static Shapes CreateFromJSON(string jsonString){
			return JsonUtility.FromJson<Shapes>(jsonString);
		}
	}

	[System.Serializable]
	public class Map
	{
		[HideInInspector] public string mapName;
		public Transform mapHolder;
		[HideInInspector] public float mapSizeX, mapSizeY;
		[HideInInspector] public int[] itemTypes;
		[HideInInspector] public int[] itemRotations;
		[HideInInspector] public float[] positionsX, positionsY;

		public static Map CreateFromJSON(string jsonString){
			return JsonUtility.FromJson<Map>(jsonString);
		}
	}

////////////////////////////////////////////////////////////////////////////////////

/////////////////////// DEBUGS /////////////////////////////////////////////////////
    void Debuger(string text) { if (showDebugs) Debug.Log(text); }
	void OnDrawGizmos()
	{
		if( showDebugs == false ) return;

		//Grid origin at current map index. If there's no holder, use this builder's position
		int itemsX, itemsY;
		bool mapAvailable = false;
		int numberOfLevels = 1;
		Gizmos.color = Color.red;

		if( levels == null ){
			itemsX = itemsY = 10;
		}
		else if( levels.Length <= 0){
			itemsX = itemsY = 10;
		}
		else{
			mapAvailable = true;
			itemsX = (int)levels[0].mapSizeX;
			itemsY = (int)levels[0].mapSizeY;
			Gizmos.color = Color.green;
			numberOfLevels = levels.Length;
		}

		//Constants
		Vector3 offset = new Vector3(0.5f, 0, 0.5f) * gridScale;

		//Prints all grid levels
		for (int level=0; level<numberOfLevels; level++){
			
			//Print grid on its level holder or an assumed possition or simply this position
			Vector3 gridOrigin;
			if( mapAvailable ){
				if( levels[level].mapHolder == null )
					gridOrigin = transform.position + GetPositionOfLevel( level );
				else
					gridOrigin = levels[level].mapHolder.position;
			}
			else{
				gridOrigin = transform.position;
			}
			
			//PRINT COLUMNS
			Vector3 cellIncrement = gridOrigin;
			Vector3 colIncrement = Vector3.forward * gridScale * itemsY;
			Vector3 rowIncrement = Vector3.right * gridScale;
			for (int i = 0; i < itemsX+1; i++)
			{
				Gizmos.DrawLine(cellIncrement - offset, colIncrement + cellIncrement - offset);
				cellIncrement += rowIncrement;
			}

			//PRINT ROWS 
			cellIncrement = gridOrigin;
			colIncrement = Vector3.right * gridScale * itemsX;
			rowIncrement = Vector3.forward * gridScale;
			for (int i = 0; i < itemsY+1; i++)
			{
				Gizmos.DrawLine(cellIncrement - offset, colIncrement + cellIncrement - offset);
				cellIncrement += rowIncrement;
			}
		}
		
		//DimentionsHelper();
	}

	void ArrayDebuger( Vector2[] vectorArray, string text = "ArrayDebuger" ) { if( showDebugs ) for( int i = 0; i < vectorArray.Length; i++ ) Debug.Log( text + " [" + i + "] " + vectorArray[i] ); }

	////////////////////////////////////////////////////////////////////////////////////

	/////////////////////// TESTS /////////////////////////////////////////////////////




}


