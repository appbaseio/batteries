import React from 'react';
import { Card, Table } from 'antd';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
 ComposableMap, ZoomableGroup, Geographies, Geography,
} from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { feature } from 'topojson-client';
import { scaleLinear } from 'd3-scale';
import { getAppGeoDistribution } from '../../../../modules/actions';
import { getAppGeoDistributionByName } from '../../../../modules/selectors';

const wrapperStyles = {
	width: '100%',
	maxWidth: 980,
	margin: '0 auto',
};

class GeoDistribution extends React.Component {
	state = {
		geographyPaths: [],
		popScale: scaleLinear()
			.domain([0, 100, 10000])
			.range(['#dce6f7', '#6CA4FF', '#1A62FF']),
	};

	componentDidMount() {
		const { fetchAppGeoDistribution } = this.props;
		fetchAppGeoDistribution();
	}

	componentDidUpdate(prevProps) {
		const { isSuccess, geoData } = this.props;
		if (isSuccess && isSuccess !== prevProps.isSuccess && geoData) {
			this.loadPaths();
		}
	}

	loadPaths() {
		const { geoData } = this.props;
		let max = 0;
		geoData.forEach((data) => {
			if (data.count > max) {
				max = data.count;
			}
		});
		this.max = max;
		const geoDataByKey = keyBy(geoData, 'key');
		fetch(
			'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/examples/basic-map/static/world-50m.json',
		)
			.then(res => res.json())
			.then((res) => {
				const world = res;
				// Transform your paths with topojson however you want...
				const countries = feature(world, world.objects[Object.keys(world.objects)[0]])
					.features;
				const results = countries.map(country => ({
					...country,
					properties: {
						count: get(geoDataByKey[country.properties.name], 'count', 0),
						...country.properties,
					},
				}));
				this.setState(
					{
						geographyPaths: results,
						popScale: scaleLinear()
							.domain([0, this.max / 2, this.max])
							.range(['#dce6f7', '#6CA4FF', '#1A62FF']),
					},
					() => {
						setTimeout(() => {
							ReactTooltip.rebuild();
						}, 100);
					},
				);
			});
	}

	render() {
		const { geographyPaths, popScale } = this.state;
		const { geoData } = this.props;
		return (
			<Card css="width: 100%" title="Geography Visualization">
				<div style={wrapperStyles}>
					<ComposableMap
						projectionConfig={{
							scale: 205,
							rotation: [-11, 0, 0],
						}}
						width={980}
						height={551}
						style={{
							width: '100%',
							height: 'auto',
						}}
					>
						<ZoomableGroup center={[0, 20]}>
							<Geographies geography={geographyPaths}>
								{(geographies, projection) => geographies.map((geography, i) => (
										<Geography
											// eslint-disable-next-line
											key={i}
											data-tip={`${geography.properties.name} (${
												geography.properties.count
											})`}
											geography={geography}
											projection={projection}
											onClick={this.handleClick}
											style={{
												default: {
													fill: popScale(geography.properties.count),
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none',
												},
												hover: {
													fill: '#F0F2F5',
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none',
												},
												pressed: {
													fill: '#263238',
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none',
												},
											}}
										/>
									))
								}
							</Geographies>
						</ZoomableGroup>
					</ComposableMap>
					<ReactTooltip />
					<Table
						dataSource={geoData}
						columns={[
							{
								dataIndex: 'key',
								title: 'Popular Countries',
								key: 'key',
							},
							{
								dataIndex: 'count',
								title: 'Searches',
								key: 'count',
							},
						]}
					/>
				</div>
			</Card>
		);
	}
}
GeoDistribution.defaultProps = {
	geoData: [],
	isSuccess: false,
};
GeoDistribution.propTypes = {
	geoData: PropTypes.array,
	isSuccess: PropTypes.bool,
	fetchAppGeoDistribution: PropTypes.func.isRequired,
};
const mapStateToProps = state => ({
	geoData: get(getAppGeoDistributionByName(state), 'aggrByCountry'),
	isSuccess: get(state, '$getAppGeoDistribution.success'),
});
const mapDispatchToProps = dispatch => ({
	fetchAppGeoDistribution: appName => dispatch(getAppGeoDistribution(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(GeoDistribution);
