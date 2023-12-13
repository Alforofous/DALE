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
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
				</div>
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