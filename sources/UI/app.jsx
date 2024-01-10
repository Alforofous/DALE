import React from 'react';
import Draggable from 'react-draggable';
import Sidebar from './sidebar.jsx';

class App extends React.Component
{
	constructor(props)
	{
		super(props);
		this.userInterface = props.userInterface;
		this.userInterface.sidebar = React.createRef();
		this.scene = props.scene;
		this.state = {
			isDraggableVisible: false,
			boreholeInfo: [],
		};
	}

	componentDidMount = () =>
	{
		console.log('App mounted');
		this.updateBoreholeInfo();
	}

	showDraggable = () =>
	{
		this.setState({ isDraggableVisible: !this.state.isDraggableVisible });
	}

	updateBoreholeInfo = () =>
	{
		const boreholeInfo = [{ text: 'Selected borehole count: ' + this.scene.boreholes.selector.selectedBoreholeIds.length }];

		if (this.scene !== undefined && this.scene.boreholes.selector.selectedBoreholeIds.length > 0)
		{
			const id = this.scene.boreholes.selector.selectedBoreholeIds[0];
			boreholeInfo.push({ text: 'Id: ' + id });
			boreholeInfo.push({ text: 'Top: ' + this.scene.boreholes.info.top[id].x.toFixed(3) + ', ' + this.scene.boreholes.info.top[id].y.toFixed(3) + ', ' + this.scene.boreholes.info.top[id].z.toFixed(3) });
			boreholeInfo.push({ text: 'Bottom: ' + this.scene.boreholes.info.bottom[id].x.toFixed(3) + ', ' + this.scene.boreholes.info.bottom[id].y.toFixed(3) + ', ' + this.scene.boreholes.info.bottom[id].z.toFixed(3) });
		}

		this.setState({ boreholeInfo: boreholeInfo });
	}

	render()
	{
		return (
			<div
				style={
					{
						position: 'absolute',
						top: '0px',
						left: '0px',
						overflow: 'hidden',
						boxSizing: 'border-box',
					}
				}
				className="color-picker-overlay">
				<Sidebar
					ref={this.userInterface.sidebar}
					scene={this.scene}
					userInterface={this.userInterface}
				/>
				<Draggable>
					<div style={{
						position: 'fixed',
						top: '5px',
						right: '5px',
						width: '200px',
						border: '1px solid black',
						borderRadius: '5px',
						backgroundColor: '#030323',
						boxSizing: 'border-box',
						zIndex: '-1',
						outline: 'none',
					}}
						className='draggable'
					>
						<div style={{
							borderBottom: '1px solid black',
							paddingBottom: '10px',
							fontWeight: 'bold',
							display: 'flex',
							justifyContent: 'space-between'
						}}>
							<div>Borehole Info</div>
							<button onClick={this.showDraggable}>
								{this.state.isDraggableVisible ? '-' : '+'}
							</button>
						</div>
						{this.state.isDraggableVisible && this.state.boreholeInfo.map((info, index) => (
							<p key={index} style={{ borderBottom: '1px solid white', userSelect: 'none' }}>{info.text}</p>
						))}
					</div>
				</Draggable>
			</div>
		);
	}
}

export { App };