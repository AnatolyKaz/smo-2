const time = 1000000
const lambda = 0.0000094
const mu = 0.000014
const eta = 0.000014
const n = 3
const channels = { channels: n, freeChannels: n }
const l = 3

let countApps = 0
let timeNewApp = 0
let refusalAppsCount = 0
let freeTimeCount = 0
let orderInterval = 0
let apps = []


for (let i = 0 ; i <= time ; i++) {

	if ( i <= timeNewApp + orderInterval ) {
		calcTimeNewApp(i)
	}


	if ( !apps.length ) {
		freeTimeCount++
	}

	if ( i === timeNewApp ) {
		if ( apps.length < channels.channels ) {
			let newApp = { serviceTime: Math.floor(-( 1 / ( l * mu + eta ) ) * Math.log(Math.random())) }
			apps.push(newApp)
		} else {
			refusalAppsCount++
		}
	}

	if ( apps.length ) {
		apps.forEach((app) => {
			if ( channels.freeChannels === channels.channels ) {
				app.serviceTime = app.serviceTime - ( channels.freeChannels - 1 )
			} else {

			}
		})
	}


}

function calcTimeNewApp(i) {
	let newTime = i + Math.floor(-( 1 / l * lambda ) * Math.log(Math.random()))
	timeNewApp = newTime < time ? newTime : timeNewApp
	orderInterval = Math.floor(-( 1 / lambda ) * Math.log(Math.random()))///25000 мс
}

console.log(Math.floor(-( 1 / ( l * lambda ) ) * Math.log(Math.random())))
