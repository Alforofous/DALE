import * as THREE from 'three';

class BoreholeMover
{
	constructor(boreholes)
	{
		this.boreholes = boreholes;
		this.oldPoint = undefined;
	}

	onMouseRelease()
	{
		this.oldPoint = undefined;
	}

	moveSelectedBoreholes(currentPoint, selectedBoreholeIds, top = true, bottom = true)
	{
		if (currentPoint === undefined || selectedBoreholeIds.length === 0 || this.boreholes === undefined)
		{
			return;
		}

		let moveVector;
		if (this.oldPoint !== undefined)
		{
			moveVector = currentPoint.clone().sub(this.oldPoint);
			for (let i = 0; i < selectedBoreholeIds.length; i++)
			{
				const boreholeId = selectedBoreholeIds[i];

				if (top)
					this.boreholes.info.top[boreholeId].add(moveVector);
				this.boreholes.info.bottom[boreholeId].add(moveVector);
				this.boreholes.snapTopTowardsParent(boreholeId);
				this.boreholes.snapBottomTowardsParent(boreholeId);
			}
		}
		this.oldPoint = currentPoint;
		this.boreholes.updateGeometryProperties();
		this.boreholes.labels.syncWithBoreholes();
	}
}

export { BoreholeMover };