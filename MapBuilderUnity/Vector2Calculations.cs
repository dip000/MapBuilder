using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class Vector2Calculations : object
{
	public static Vector2 BoundingBoxCenterOfCoordenates(Vector2[] coordenates)
	{
		//The middle of the farthest point in X,Y is the bounding box center
		return ( BoundsOfCoordenates( coordenates ) * 0.5f );
	}
	public static Vector2 BoundsOfCoordenates( Vector2[] points )
	{
		Vector2 maxBoundsPoint = Vector3.zero;
		for( int i = 0; i < points.Length; i++ )
		{
			if( points[i].x > maxBoundsPoint.x )
				maxBoundsPoint.x = points[i].x;

			if( points[i].y > maxBoundsPoint.y )
				maxBoundsPoint.y = points[i].y;
		}
		return maxBoundsPoint;
	}

	static Vector2[] ReferenceCoordenates(Vector2[] coordenates, Vector2 reference)
    {
		Vector2[] referenced= new Vector2[coordenates.Length];

		for (int i = 0; i < coordenates.Length; i++)
			referenced[i] = coordenates[i] + reference;
		return coordenates;
	}

	public static Vector2[] GlobalizeCoordenates(Vector2[] localCoordenates, Vector2 positionIndex){
		return ReferenceCoordenates(localCoordenates, positionIndex);
	}

	public static Vector2[] LocalizeCoordenates(Vector2[] globalCoordenates, Vector2 positionIndex) { 
		return ReferenceCoordenates(globalCoordenates, -positionIndex);
	}

	public static Vector2[] RotateMatrixAngle(Vector2[] vector, int angle)
	{
		//changes angle in degrees by times to rotate 90 degrees
		int times;
		if (angle < 0)
			times = 4 - (angle % 360) / 90;
		else
			times = -(angle % 360) / 90;

		//Rotate 4 times 90 degrees is not rotating at all
		if (times == 4)
			return vector;

		return RotateMatrixTimes(vector, times);
	}
	
	public static Vector2[] RotateMatrixTimes(Vector2[] vector, int times) {

		Vector2[] vectorOut = new Vector2[vector.Length];
		vector.CopyTo(vectorOut, 0);

		for (int rotateTimes = 0; rotateTimes< times; rotateTimes++) {
			float xMax = 0;

			//Mirror on 45 degrees
			for (int i = 0; i < vectorOut.Length; i++)
			{
				float xTemp = vectorOut[i].x;
				vectorOut[i].x = vectorOut[i].y;
				vectorOut[i].y = xTemp;

				//A reference to mirror the Y axis
				if (vectorOut[i].x > xMax)
					xMax = vectorOut[i].x;
			}

			//Mirror on Y axis
			for (int i = 0; i < vectorOut.Length; i++)
				vectorOut[i].x = xMax - vectorOut[i].x;

		}

		return vectorOut;
	}
	
	public static Vector2[] VectorizeComponents(float[] x, float[] y){
		Vector2[] vectorized = new Vector2[x.Length];
		for(int i=0; i<x.Length; i++){
			vectorized[i].x = x[i];
			vectorized[i].y = y[i];
		}
		return vectorized;
	}
	



}
