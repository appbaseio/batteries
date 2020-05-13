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
import Filter from '../Filter';
import { getAppGeoDistribution, setFilterValue } from '../../../../modules/actions';
import { getAppGeoDistributionByName } from '../../../../modules/selectors';
import { getUrlParams } from '../../../../../utils/helper';
import { applyFilterParams } from '../../utils';

const wrapperStyles = {
	width: '100%',
	maxWidth: 980,
	margin: '0 auto',
};

class GeoDistribution extends React.Component {
	state = {
		key: new Date().toISOString(),
		geographyPaths: [],
		popScale: scaleLinear()
			.domain([0, 100, 10000])
			.range(['#dce6f7', '#6CA4FF', '#1A62FF']),
	};

	componentDidMount() {
		const { fetchAppGeoDistribution, filterId, selectFilterValue, filters } = this.props;

		applyFilterParams({
			filters,
			callback: fetchAppGeoDistribution,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { geoData, filters } = this.props;
		if (JSON.stringify(prevProps.geoData) !== JSON.stringify(geoData)) {
			this.loadPaths();
		}
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			const { fetchAppGeoDistribution } = this.props;
			fetchAppGeoDistribution();
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
			'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/0.12.1/examples/basic-map/static/world-50m.json',
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
						key: new Date().toISOString(),
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
		const { geographyPaths, popScale, key } = this.state;
		const { geoData, filterId, displayFilter } = this.props;
		return (
			<React.Fragment>
				{displayFilter && filterId && <Filter filterId={filterId} />}
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
								<Geographies
									key={key}
									geography={geographyPaths}
								>
									{(geographies, projection) => geographies.map((geography, i) => (
											<Geography
												// eslint-disable-next-line
												key={i}
												data-tip={`${geography.properties.name} (${geography.properties.count})`}
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
			</React.Fragment>
		);
	}
}
GeoDistribution.defaultProps = {
	geoData: [],
	displayFilter: true,
	filterId: undefined,
	filters: undefined,
};
GeoDistribution.propTypes = {
	displayFilter: PropTypes.bool,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	geoData: PropTypes.array,
	fetchAppGeoDistribution: PropTypes.func.isRequired,
};
const mapStateToProps = (state, props) => ({
	geoData: get(getAppGeoDistributionByName(state), 'geo_distribution', []),
	filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppGeoDistribution: (appName) => dispatch(getAppGeoDistribution(appName, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(GeoDistribution);
