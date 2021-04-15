
statisticCalcParam()

//imitation()
function imitation() {
	const time = 3600 //с
	const lambda = 0.09445
	const mu = 0.01425
	const n = 6
	const l = 3

	let freeChannels = n
	let countApps = [] //обслуженные заявки
	let allApps = 0
	let timeNewApp = 0 //время прихода новой заявки
	let refusalAppsCount = 0 // количество заявок с отказом
	let freeTimeCount = 0 //время простоя системы
	let apps = [] //массив заявок на обслуживании

	////=======main cycle==================

	for (let i = 0; i <= time; i++) {

		apps = apps.length
			? apps.filter((app) => {
					if (app.serviceTime + app.arrivalTimeApp === i) {
						freeChannels += app.workingChannels
						countApps.push(app)
						return 0
					} else {
						return 1
					}
			})
			: apps

		if (freeChannels) {
			apps = redistributionChannels(apps, i)
		}

		timeNewApp = i ? timeNewApp : getTimeNewApp(i)

		if (i === timeNewApp) {
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
						apps = sortByWorkingChannels(apps, '>')

						if (apps[0].workingChannels > 1) {
							let recalcChannels = recalcServiceTimeApp(
								apps[0],
								newApp,
								i
							)
							apps[0] = recalcChannels.currentApp
							newApp = recalcChannels.newApp
							apps.push(newApp)
							continue
						}
					} else if (l === n && apps.length === 1) {
						let recalcChannels = recalcServiceTimeApp(
							apps[0],
							newApp,
							i
						)
						apps[0] = recalcChannels.currentApp
						newApp = recalcChannels.newApp
						apps.push(newApp)
					} else {
						let remainderChannels = n - apps[0].workingChannels

						newApp.serviceTime = getServiceTime(remainderChannels)
						newApp.workingChannels = remainderChannels
						apps.push(newApp)
					}
				}
			}
		}

		if (!apps.length && i) {
			freeTimeCount++
		}
	}
	////=======main cycle==================
	///===========calc parameters============
	let probabilityChannelBusyTime =(time - freeTimeCount) / time / n
	return {
		allApps,
		probabilityService: 1 - refusalAppsCount / allApps,
		freeTimeCount,
		probabilityChannelBusyTime,
		countApps: countApps.length
	}
	///===========calc parameters============
	//////==========functions=====================
	function redistributionChannels(apps, i) {
		if (apps.length) {
			apps = sortByWorkingChannels(apps, '<')

			for (let j = 0; j < apps.length; j++) {
				while (freeChannels) {
					if (apps[j].workingChannels < 3) {
						apps[j].workingChannels += 1
						freeChannels -= 1
						apps[j].serviceTime =
							i -
							apps[0].arrivalTimeApp +
							getServiceTime(apps[0].workingChannels)
					} else {
						break
					}
				}
			}
		}

		return apps
	}

	function sortByWorkingChannels(apps, marker) {
		if (marker === '>') {
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
		if (marker === '<') {
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
		return i + Math.round((-1 / (lambda) ) * Math.log(getRandom()))
	}

	function getServiceTime(l) {
		return Math.round((-1 / (l * mu)) * Math.log(getRandom()))
	}

	function getRandom() {
		let min = 0.0000000001
		let max = 0.9
		return Math.random() * (max - min) + min
	}
}


function statisticCalcParam() {
	let data = []

	for (let i = 0; i < 100; i++) {
		data.push(imitation())
	}
	data.sort((prev, next) => {
		if (prev.allApps < next.allApps) {
			return 1
		}
		if (prev.allApps > next.allApps) {
			return -1
		}
		return 0
	})

	let mostWorkingChannels = data.splice(0, 9)
	let sumProbServ = 0
	let sumFreeTime = 0
	let channelBusyTime = 0
	let allApps = 0
	let doneApps = 0
	
	mostWorkingChannels.forEach((app) => {
		allApps += app.allApps
		doneApps += app.countApps
		sumProbServ += app.probabilityService
		sumFreeTime += app.freeTimeCount
		channelBusyTime += app.probabilityChannelBusyTime
	})

	let midProbServ = sumProbServ / 10
	let midFreeTime = sumFreeTime / 10
	let midProbBusyChannel = channelBusyTime / 10

	console.log('\n')
	console.log(allApps / 10)
	console.log(doneApps / 10)
	console.log(`средняя вероятность обслуживания: ${midProbServ}`)
	console.log(`среднее время простоя: ${midFreeTime } сек`)
	console.log(`Вероятность занятости системы: ${(3600 - midFreeTime) / 3600} `)
	console.log(`Вероятность занятости канала: ${midProbBusyChannel} `)
	console.log('\n')
}
