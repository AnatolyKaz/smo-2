const time = 360000 //с
const lambda = 0.094
const mu = 0.014
const n = 3
const l = 3

let freeChannels = n
let countApps = [] //обслуженные заявки
let allApps = 0
let timeNewApp = 0 //время прихода новой заявки
let refusalAppsCount = 0 // количество заявок с отказом
let freeTimeCount = 0 //время простоя системы
let apps = [] //массив заявок на обслуживании

for (let i = 0; i <= time; i++) {
	apps = apps.length
		? apps.filter((app) => {
				if (app.serviceTime + app.arrivalTimeApp === i) {
					freeChannels += app.workingChannels
					countApps.push(app)
					apps = redistributionChannels(apps, i)
					return 0
				} else {
					return 1
				}
		})
		: apps

	timeNewApp = i ? timeNewApp : getTimeNewApp(i)

	if (i === timeNewApp) {
		debugger

		allApps++
		timeNewApp = getTimeNewApp(i)

		if (apps.length === n) {
			refusalAppsCount++
		} else {
			let newApp = {
				serviceTime: getServiceTime(l),
				arrivalTimeApp: i,
				workingChannels: l,
			}

			if (!apps.length) {
				
			}

			if (!apps.length && l <= n) {
				freeChannels -= l
				apps.push(newApp)
				continue
			}

			if (n >= 2 * l && apps.length === 1) {
				freeChannels -= l
				apps.push(newApp)
				continue
			}

			if ((apps.length + 1) * l <= n) {
				freeChannels -= l
				apps.push(newApp)
				continue
			}

			if ((apps.length + 1) * l > n && apps.length < n) {
				if (apps.length > 1) {
					apps = sortByWorkingChannels(apps,'>')

					if (apps[0].workingChannels > 1) {
						let recalcChannels = recalcServiceTimeApp(
							apps[0],
							newApp,
							i
						)
						apps[0] = recalcChannels.currentApp
						newApp = recalcChannels.newApp
					}
				} else if (l === n && apps.length === 1) {
					let recalcChannels = recalcServiceTimeApp(
						apps[0],
						newApp,
						i
					)
					apps[0] = recalcChannels.currentApp
					newApp = recalcChannels.newApp
				} else {
					let remainderChannels = n - apps[0].workingChannels

					newApp.serviceTime = getServiceTime(remainderChannels)
					newApp.workingChannels = remainderChannels
				}

				apps.push(newApp)
			}
		}
	}

	if (!apps.length && i) {
		freeTimeCount++
	}
}

function redistributionChannels(apps, i){

	apps = sortByWorkingChannels(apps, '<')

	for (let j = 0; j < apps.length; j++) {
		while (freeChannels){
			if (apps[j].workingChannels < 3){
				apps[j].workingChannels += 1
				apps[j].serviceTime = i - apps[0].arrivalTimeApp + getServiceTime(apps[0].workingChannels)
			} else {
				break
			}
		}
	}

	return apps
}

function sortByWorkingChannels(apps, marker){
	if (marker === '>'){
		apps.sort((prev, next) => {
			if (prev.workingChannels < next.workingChannels) {
				return 1
			}
			if (prev.workingChannels > next.workingChannels) {
				return -1
			}
			return 0
		})
	}
	if (marker === '<'){
		apps.sort((prev, next) => {
			if (prev.workingChannels < next.workingChannels) {
				return 1
			}
			if (prev.workingChannels > next.workingChannels) {
				return -1
			}
			return 0
		})
	}

	return apps
}

function recalcServiceTimeApp(currentApp, newApp, i) {
	currentApp = recalcServiceTime(currentApp, i)
	newApp.serviceTime = getServiceTime(1)
	newApp.workingChannels = 1

	return { currentApp, newApp }
}

function recalcServiceTime(app, i) {
	app.workingChannels -= 1
	app.serviceTime =
		i - app.arrivalTimeApp + getServiceTime(app.workingChannels)

	return app
}

function getTimeNewApp(i) {
	return i + Math.trunc((-1 / lambda) * Math.log(getRandom()))
}

function getServiceTime(l) {
	return Math.trunc((-1 / (l * mu)) * Math.log(getRandom()))
}

function getRandom(){
	let min = 0.0000000001
	let max = 0.9999999999
	return Math.random() * (max - min) + min
}


console.log(refusalAppsCount)
console.log(freeTimeCount)
console.log(countApps.length)
console.log(allApps)
console.log(`Pser: ${(1 - (refusalAppsCount/allApps))}` )
