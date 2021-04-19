statisticCalcParam(3, 6)

//==============imitation=================
function imitation(currentN) {
	const time = 3600 //с
	const lambda = 0.09445
	const mu = 0.01425
	const n = currentN
	const l = 3

	let freeChannels = n
	let countApps = [] //обслуженные заявки
	let allApps = 0
	let timeNewApp = 0 //время прихода новой заявки
	let refusalAppsCount = 0 // количество заявок с отказом
	let freeTimeCount = 0 //время простоя системы
	let apps = [] //массив заявок на обслуживании
	let midFreeChannels = []
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
						apps = sortByWorkingChannels(apps)

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
						newApp.serviceTime = getServiceTime(freeChannels)
						newApp.workingChannels = freeChannels
						freeChannels = 0
						apps.push(newApp)
					}
				}
			}
		}
		midFreeChannels.push(freeChannels)

		if (!apps.length && i) {
			freeTimeCount++
		}
	}
	////=======main cycle==================
	///===========calc parameters============
	let probabilityChannelBusyTime = (time - freeTimeCount) / time / n
	let i = midFreeChannels.reduce((acc, current) => (acc += current))
	let b = i / n
	midFreeChannels = i / midFreeChannels.length
	return {
		allApps,
		probabilityService: 1 - refusalAppsCount / allApps,
		freeTimeCount,
		probabilityChannelBusyTime,
		countApps: countApps.length,
		midFreeChannels,
		b,
	}
	///===========calc parameters============
	//////==========functions=====================
	function redistributionChannels(apps, i) {
		if (apps.length) {
			for (let j = 0; j < apps.length; j++) {
				while (freeChannels) {
					if (apps[j].workingChannels < l) {
						apps[j].workingChannels += 1
						freeChannels -= 1
						apps[j].serviceTime =
							i -
							apps[j].arrivalTimeApp +
							getServiceTime(apps[j].workingChannels)
					} else {
						break
					}
				}
			}
		}

		return apps
	}

	function sortByWorkingChannels(apps) {
		apps.sort((prev, next) => {
			if (prev.workingChannels < next.workingChannels) {
				return 1
			}
			if (prev.workingChannels > next.workingChannels) {
				return -1
			}
			return 0
		})

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
		return i + Math.round((-1 / lambda) * Math.log(getRandom()))
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
//==============imitation=================

///==============calc statistic===============
function statisticCalcParam(n1, n2) {
	let pirsonStatService = 0
	let pirsonStatWorkCh = 0
	let pirsonStatFreeTimeCh = 0

	for (let index = n1; index <= n2; index++) {
		let data = []

		for (let i = 0; i < 100; i++) {
			data.push(imitation(index))
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

		let sumProbServ = 0
		let freeChannels = 0
		let b = 0

		let p1 = 0 ///результаты аналитического моделирования для вероятности обслуживания
		let p2 = 0 ///результаты аналитического моделирования для вероятности занятости канала

		switch (index) {
			case n1:
				p1 = 0.429
				p2 = 0.947
				break
			case n1 + 1:
				p1 = 0.569
				p2 = 0.919
				break
			case n1 + 2:
				p1 = 0.743
				p2 = 0.83
				break
			case n2:
				p1 = 0.845
				p2 = 0.735
				break
		}

		data.forEach((app) => {
			sumProbServ += app.probabilityService
			freeChannels += app.midFreeChannels
			b += app.b
		})

		let midProbServ = sumProbServ / 100

		pirsonStatService += Math.pow(midProbServ - p1, 2) / p1
		pirsonStatWorkCh +=
			Math.pow((index - freeChannels / 100) / index - p2, 2) / p2

		console.log('\n')
		console.log(`Вероятность обслуживания: ${midProbServ}`)
		console.log(`Время простоя канала: ${b / 100} сек`)
		console.log(
			`Вероятность занятости канала: ${
				(index - freeChannels / 100) / index
			} `
		)
	}
	console.log('\n')
	console.log(
		`Критерий пирсона для вероятности обслуживания: ${pirsonStatService}`
	)
	console.log(
		`Критерий пирсона для вероятности занятости канала: ${pirsonStatWorkCh}`
	)
	console.log(
		`Критерий пирсона для среднего времени простоя канала : ${pirsonStatFreeTimeCh}`
	)
	console.log('\n')
}
///==============calc statistic===============
