const time = 1000000 //мс
const lambda = 0.0000094
const mu = 0.000014
//const eta = 0.000014
const n = 3
const channels = { channels: n, freeChannels: n }
const l = 3

let countApps = [] //обслуженные заявки
let timeNewApp = 0 //время прихода новой заявки
let refusalAppsCount = 0 // количество заявок с отказом
let freeTimeCount = 0 //время простоя системы
let apps = [] //массив заявок на обслуживании

for (let i = 0; i <= time; i++) {
	if (!apps.length) {
		freeTimeCount++
	}

	timeNewApp = i ? timeNewApp : getTimeNewApp()

	if (i === timeNewApp) {
		timeNewApp = getTimeNewApp()

		if (!i) {
			if (apps.length === n) {
				refusalAppsCount++
			} else {
				let newApp = {
					serviceTime: getServiceTime(l),
					arrivalTimeApp: i,
					workingChannels: l,
				}

				if (!apps.length && l <= n) {
					apps.push(newApp)
				}

				if (n >= 2 * l && apps.length === 1) {
					apps.push(newApp)
				}

				if ((apps.length + 1) * l <= n) {
					apps.push(newApp)
				}

				if ((apps.length + 1) * l > n && apps.length < n) {
					//let freeChannels =
					apps = apps.map((app) => {
						app.serviceTime =
							i - app.arrivalTimeApp + getServiceTime()
					})
				}
			}
		}
	}
}

function getTimeNewApp() {
	return (-1 / lambda) * Math.log(Math.random())
}

function getServiceTime(l) {
	return (-1 / (l * mu)) * Math.log(Math.random())
}
