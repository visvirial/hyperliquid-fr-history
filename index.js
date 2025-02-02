
const { createApp, ref } = Vue;

const fetchFundingHistory = async (
	coin,
	startTime = Date.now() - 1000 * 60 * 60 * 24 * 7,
	endTime = Date.now(),
) => {
	const history = (await (await fetch(
		'https://api.hyperliquid.xyz/info',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'fundingHistory',
				coin,
				startTime,
				endTime,
			}),
		}
	)).json());
	console.log(history);
	return history;
};

const drawFor = async (coin) => {
	const frHistory = await fetchFundingHistory(coin);
	Highcharts.chart(`fr-history`, {
		title: {
			text: `Funding Rate History for ${coin}`,
		},
		xAxis: {
			title: {
				text: 'Date',
			},
			type: 'datetime',
		},
		yAxis: {
			title: {
				text: 'Funding Rate (APR)',
			},
		},
		series: [
			{
				name: 'Funding Rate',
				data: frHistory.map((fr) => [fr.time, +fr.fundingRate * 24 * 365 * 100]),
			},
		],
	});
};

window.addEventListener('load', async () => {
	const metas = (await (await fetch(
		'https://api.hyperliquid.xyz/info',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'meta',
			}),
		}
	)).json()).universe;
	//console.log(metas);
	createApp({
		setup() {
			return {
				coins: metas.map((meta) => meta.name),
			};
		},
		async created() {
			await drawFor(metas[0].name);
		},
		methods: {
			async selectCoin(event) {
				const coin = event.target.value;
				await drawFor(coin);
			}
		},
	}).mount('#app');
});

