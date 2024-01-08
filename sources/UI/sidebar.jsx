import React from 'react';
import ToolMenu from './toolMenu';
import ToggleButton from './toggleButton';
import ColorPicker from './colorPicker';
import NumberInput from './numberInput';
import Slider from './slider';
import * as THREE from 'three';

class Sidebar extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			activeToolMenuIndex: null,
			boreholeCount: props.scene.boreholes.count,
		};
		this.toolMenus = [];
		this.scene = props.scene;
		this.setMin = this.setMin.bind(this);
		this.setMax = this.setMax.bind(this);
	}

	activateToolMenu = (index) =>
	{
		this.setState({ activeToolMenuIndex: index });
	};

	selectNextToolButtonAndActivateMenu(index)
	{
		if (this.state.activeToolMenuIndex !== index)
		{
			this.activateToolMenu(index);
			this.toolMenus[index].current.selectCurrentToolButton(0);
		}
		else
		{
			this.toolMenus[index].current.selectNextToolButton();
		}
	}

	handleOpacitySliderChange = (value) =>
	{
		this.scene.changeTerrainMeshOpacity(value / 100);
	};

	handleTerrainBottomColorChange = (color) =>
	{
		this.terrainBottomColor = new THREE.Color(color);
		if (this.terrainTopColor !== undefined && this.terrainTopColor !== null)
			this.scene.modelLoader.changeModelColor(this.terrainBottomColor, this.terrainTopColor);
	}

	handleTerrainTopColorChange = (color) =>
	{
		this.terrainTopColor = new THREE.Color(color);
		if (this.terrainBottomColor !== undefined && this.terrainBottomColor !== null)
			this.scene.modelLoader.changeModelColor(this.terrainBottomColor, this.terrainTopColor);
	}

	handleBoreholeSliderChange = (value) =>
	{
		this.setState({ boreholeCount: value }, () =>
		{
			this.scene.boreholes.count = this.state.boreholeCount;
			this.scene.boreholes.labels.count = this.state.boreholeCount;
		});
	}

	toggleTerrainWireframe = () =>
	{
		this.scene.toggleTerrainWireframe();
	}

	toggleBoreholeLabelVisibility = () =>
	{
		this.scene.toggleBoreholeLabelVisibility();
	}

	setMin()
	{
		this.setState({ boreholeCount: 0 }, () =>
		{
			this.scene.boreholes.count = this.state.boreholeCount;
			this.scene.boreholes.labels.count = this.state.boreholeCount;
		});
	}

	setTo = (value) =>
	{
		this.setState({ boreholeCount: value }, () =>
		{
			this.scene.boreholes.count = this.state.boreholeCount;
			this.scene.boreholes.labels.count = this.state.boreholeCount;
		});
	}

	setMax()
	{
		this.setState({ boreholeCount: this.scene.boreholes.instanceCount }, () =>
		{
			this.scene.boreholes.count = this.state.boreholeCount;
			this.scene.boreholes.labels.count = this.state.boreholeCount;
		});
	}

	render()
	{
		this.buttonsData = [
			{ text: 'Boreholes', toolButtons: ['Add', 'Select', 'Move', 'Scatter'] },
			{ text: 'Spawn Cones', toolButtons: ['Tool 2-0', 'Tool 2-1'] },
		];

		return (
			<div id="sidebar">
				{this.buttonsData.map((button, index) =>
				{
					this.toolMenus[index] = React.createRef();
					return (
						<ToolMenu
							key={index}
							ref={this.toolMenus[index]}
							isActive={this.state.activeToolMenuIndex === index}
							onClick={() => this.activateToolMenu(index)}
							text={button.text}
							toolButtons={button.toolButtons}
						/>
					);
				})}
				<hr />
				<ColorPicker
					description="Terrain Bottom Color"
					color="#129A2B"
					onChange={this.handleTerrainBottomColorChange}
					scene={this.scene}
				/>
				<ColorPicker
					description="Terrain Top Color"
					color="#A0A0A0"
					onChange={this.handleTerrainTopColorChange}
					scene={this.scene}
				/>
				<Slider 
					value={70}
					scene={this.scene}
					description="Terrain Opacity"
					onChange={this.handleOpacitySliderChange}
				/>
				<ToggleButton
					onClick={this.toggleTerrainWireframe}
				>
					Terrain Wireframe
				</ToggleButton>
				<hr />
				<NumberInput
					value={this.state.boreholeCount}
					scene={this.scene}
					description={`Borehole count (0-${this.scene.boreholes.instanceCount})`}
					onChange={this.handleBoreholeSliderChange}
					min={0}
					max={this.scene.boreholes.instanceCount}
				/>
				<button onClick={this.setMin}>Min</button>
				<button onClick={() => this.setTo(100)}>100</button>
				<button onClick={() => this.setTo(1000)}>1000</button>
				<button onClick={this.setMax}>Max</button>
				<ToggleButton
					onClick={this.toggleBoreholeLabelVisibility}
					isActive={false}
				>
					Borehole Label Visibility
				</ToggleButton>
			</div>
		);
	}
}

export default Sidebar;