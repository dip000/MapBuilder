using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(MapBuilderManager))]
public class MapBuilderCustomEditor : Editor
{
	public override void OnInspectorGUI()
	{
		EditorGUILayout.LabelField("Notes:");
		EditorGUILayout.LabelField(" 1. Graphics must be bounding box centered");
		base.OnInspectorGUI();
		EditorGUILayout.Space(20);

		MapBuilderManager builder = (MapBuilderManager)target;

		if (GUILayout.Button("Update Map"))
			builder.BuildAllLevels();

		if (GUILayout.Button("Reset Everything"))
			builder.DestroyAllLevels();

	}
	
}
