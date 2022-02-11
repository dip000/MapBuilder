using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(MapBuilderManager))]
public class MapBuilderCustomEditor : Editor
{
	public override void OnInspectorGUI()
	{
		//EditorGUILayout.LabelField("Select Graphics for each item. Otherwise, will use placeholders");
		base.OnInspectorGUI();
		EditorGUILayout.Space(20);


		MapBuilderManager builder = (MapBuilderManager)target;


		/*EditorGUILayout.LabelField("To automatically create a holder for your graphics");
		EditorGUILayout.LabelField("so they are placed correctly");*/
		if (GUILayout.Button("Update Map"))
			builder.MakeLevel();

		if (GUILayout.Button("Reset Map"))
			builder.ResetItems();

	}
	
	/*[DrawGizmo(GizmoType.Selected | )]
	void OnDrawGizmosSelected()
	{
		Gizmos.color = Color.red;
		Gizmos.DrawLine(Vector3.zero, Vector3.up*20);
	}*/
}
