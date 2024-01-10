import React from 'react';
import ToolMenu from './toolMenu';
import ToggleButton from './toggleButton';
import ColorPicker from './colorPicker';
import NumberInput from './numberInput';
import Slider from './slider';
import Draggable from 'react-draggable';
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
			selectedBoreholeIds: props.scene.boreholes.selector.selectedBoreholeIds,
		};
		this.userInterface = props.userInterface;
		this.toolMenus = [];
		this.scene = props.scene;
	}

	activateToolMenu = (index) =>
	{
		this.setState({ activeToolMenuIndex: index });
	}

	selectNextToolButtonAndActivateMenu = (index) =>
	{
		if (this.state.activeToolMenuIndex !== index)
		{
			this.activateToolMenu(index);
			if (this.toolMenus[index]?.current !== undefined)
				this.toolMenus[index].current.selectCurrentToolButton(0);
		}
		else
		{
			this.toolMenus[index]?.current.selectNextToolButton();
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
		this.scatterUninitializedBoreholes();
	}

	toggleTerrainWireframe = () =>
	{
		this.scene.toggleTerrainWireframe();
	}

	toggleBoreholeLabelVisibility = () =>
	{
		this.scene.toggleBoreholeLabelVisibility();
	}

	scatterUninitializedBoreholes = () =>
	{
		const ids = [];
		for (let i = 0; i < this.scene.boreholes.instanceCount; i++)
		{
			if (this.scene.boreholes.info.top[i] === undefined || this.scene.boreholes.info.top[i].x === 0 || this.scene.boreholes.info.top[i].y === 0 || this.scene.boreholes.info.top[i].z === 0)
			{
				ids.push(i);
			}
		}
		this.scene.boreholes.scatterWithIds(ids);
	}

	addBoreholes = (value) =>
	{
		let boreholeCount = Math.min(this.state.boreholeCount + value, this.scene.boreholes.instanceCount);
		boreholeCount = Math.max(boreholeCount, 0);
		this.setState({ boreholeCount: boreholeCount }, () =>
		{
			this.scene.boreholes.count = this.state.boreholeCount;
			this.scene.boreholes.labels.count = this.state.boreholeCount;
			if (this.scene.boreholes.selector.selectedBoreholeIds.length > this.state.boreholeCount)
			{
				this.scene.boreholes.selectAll();
				this.userInterface.app.current.updateBoreholeInfo();
			}
		});
		this.scatterUninitializedBoreholes();
	}

	handleScatter = () =>
	{
		this.scene.boreholes.scatterSelected();
	}

	handleDelete = () =>
	{
		this.scene.boreholes.deleteSelected();
		this.userInterface.app.current.updateBoreholeInfo();
	}

	handleSelectAll = () =>
	{
		this.scene.boreholes.selectAll();
		this.userInterface.app.current.updateBoreholeInfo();
	}

	handleDeselectAll = () =>
	{
		this.scene.boreholes.selectWithIds([]);
		this.userInterface.app.current.updateBoreholeInfo();
	}

	render()
	{
		this.toolMenu = [
			{
				text: 'Boreholes',
				toolButtons: ['Add', 'Select'],
				extraButtons: [
					{ text: 'Select All', onClick: this.handleSelectAll },
				]
			},
		];

		if (this.scene.boreholes.selector.selectedBoreholeIds.length > 0)
		{
			this.toolMenu[0].extraButtons.push({ text: 'Deselect All', onClick: this.handleDeselectAll });
			this.toolMenu[0].extraButtons.push({ text: 'Delete', onClick: this.handleDelete });
			this.toolMenu[0].extraButtons.push({ text: 'Scatter', onClick: this.handleScatter });
		}

		if (this.scene.boreholes.selector.selectedBoreholeIds.length > 0)
		{
			this.toolMenu[0].toolButtons.push('Move');
		}

		return (
			<div id="sidebar" style={{
				WebkitUserSelect: 'none',
				MozUserSelect: 'none',
				msUserSelect: 'none',
				userSelect: 'none',
			}
			}
			>
				{this.toolMenu.map((button, index) =>
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
							extraButtons={button.extraButtons}
						/>
					);
				})}
				<hr />
				<ColorPicker
					description="Terrain Bottom Color"
					color="#477EFF"
					onChange={this.handleTerrainBottomColorChange}
					scene={this.scene}
				/>
				<ColorPicker
					description="Terrain Top Color"
					color="#FFFFFF"
					onChange={this.handleTerrainTopColorChange}
					scene={this.scene}
				/>
				<Slider 
					value={50}
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
				<button onClick={() => this.addBoreholes(-100)}>-100</button>
				<button onClick={() => this.addBoreholes(100)}>+100</button>
				<br />
				<button onClick={() => this.addBoreholes(-1000)}>-1000</button>
				<button onClick={() => this.addBoreholes(1000)}>+1000</button>
				<br />
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