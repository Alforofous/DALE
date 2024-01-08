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
		};
		this.toolMenus = [];
		this.scene = props.scene;
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
		this.scene.boreholes.count = value;
		this.scene.boreholes.labels.count = value;
	}

	toggleTerrainWireframe = () =>
	{
		this.scene.toggleTerrainWireframe();
	}

	toggleBoreholeLabelVisibility = () =>
	{
		this.scene.toggleBoreholeLabelVisibility();
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
				<ToggleButton
					onClick={this.toggleBoreholeLabelVisibility}
					isActive={true}
				>
					Borehole Label Visibility
				</ToggleButton>
				<NumberInput
					value={this.scene.boreholes.count}
					scene={this.scene}
					description={`Borehole count (0-${this.scene.boreholes.instanceCount})`}
					onChange={this.handleBoreholeSliderChange}
					min={0}
					max={this.scene.boreholes.instanceCount}
				/>
			</div>
		);
	}
}

export default Sidebar;