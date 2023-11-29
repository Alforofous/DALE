import * as THREE from 'three';

class BoreholeMover
{
	constructor(scene)
	{
		this.scene = scene;
		this.oldPoint = undefined;
	}

	onMouseRelease()
	{
		this.oldPoint = undefined;
	}

	moveSelectedBoreholes(currentPoint, selectedBoreholeIds)
	{
		if (currentPoint === undefined || selectedBoreholeIds.length === 0 || this.scene.boreholes === undefined)
		{
			return;
		}

		let moveVector;
		if (this.oldPoint !== undefined)
		{
			moveVector = currentPoint.clone().sub(this.oldPoint);
			let instanceMatrix = new THREE.Matrix4();
			let position = new THREE.Vector3();
			for (let i = 0; i < selectedBoreholeIds.length; i++)
			{
				const boreholeId = selectedBoreholeIds[i];
				this.scene.boreholes.getMatrixAt(boreholeId, instanceMatrix);
				position.setFromMatrixPosition(instanceMatrix);
				position.add(moveVector);
				instanceMatrix.setPosition(position);
				this.scene.boreholes.setMatrixAt(boreholeId, instanceMatrix);
			}
		}
		this.oldPoint = currentPoint;
		this.scene.boreholes.instanceMatrix.needsUpdate = true;
		this.scene.boreholes.computeBoundingBox();
		this.scene.boreholes.computeBoundingSphere();
		
		this.scene.boreholes.labels.syncWithBoreholes();
	}
}

export { BoreholeMover };