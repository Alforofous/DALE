import React from 'react';
import ToolMenu from './ToolMenu';
import ColorPicker from './colorPicker';
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

	handleTerrainBottomColorChange = (color, changeModelColor) =>
	{
		this.terrainBottomColor = new THREE.Color(color);
		if (changeModelColor)
			this.scene.modelLoader.changeModelColor(this.terrainBottomColor, this.terrainTopColor);
	}

	handleTerrainTopColorChange = (color, changeModelColor) =>
	{
		this.terrainTopColor = new THREE.Color(color);
		if (changeModelColor)
			this.scene.modelLoader.changeModelColor(this.terrainBottomColor, this.terrainTopColor);
	}

	render()
	{
		this.buttonsData = [
			{ text: 'Boreholes', toolButtons: ['Add', 'Select', 'Move'] },
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
					description="Terrain Top Color"
					ref={this.terrainTopColorPicker}
					onChange={this.handleTerrainTopColorChange}
				/>
				<ColorPicker
					description="Terrain Bottom Color"
					ref={this.terrainBottomColorPicker}
					onChange={this.handleTerrainBottomColorChange}
				/>
				<Slider 
					scene={this.scene}
					description="Terrain Opacity"
					onChange={this.handleOpacitySliderChange}
				/>
			</div>
		);
	}
}

export default Sidebar;