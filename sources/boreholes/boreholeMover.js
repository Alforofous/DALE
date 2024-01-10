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
				const boreholeIndex = this.boreholes.info.id.indexOf(boreholeId);

				if (top)
					this.boreholes.info.top[boreholeIndex].add(moveVector);
				this.boreholes.info.bottom[boreholeIndex].add(moveVector);
				this.boreholes.snapTopTowardsParent(boreholeIndex);
				this.boreholes.snapBottomTowardsParent(boreholeIndex);
			}
		}
		this.oldPoint = currentPoint;
		this.boreholes.updateGeometryProperties();
		this.boreholes.labels.syncWithPairedBorehole();
	}
}

export { BoreholeMover };