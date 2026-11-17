'use strict'
const canvas = document.getElementById('canvas_XYR')
const correctX = ['-2', '-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5', '2']
const correctR = ['1', '2', '3', '4', '5']
const y_limit = 3
const URL = 'fcgi-bin/server.jar'
const ctx = canvas.getContext('2d')
const forms = document.getElementById('forms')
const coord_Y = document.getElementById('textY')
const checkboxesR = document.querySelectorAll('input[name="r"]')
const submitButton = document.getElementById('submitButton')
const resultTableBody = document.getElementById('resultTableBody')
const centerX = canvas.width / 2
const centerY = canvas.height / 2
const blueCol = '#4671f1'

const errorX = document.getElementById('errorX')
const errorY = document.getElementById('errorY')
const errorR = document.getElementById('errorR')
const errorServer = document.getElementById('errorServer')

let resultsCheckedObjects = []
const storage_name = 'results'

function pxPerWidthR(r) {
	return canvas.width / (2 * r + 10)
}

function getCheckedValue(name) {
	const checked = document.querySelectorAll(`input[name="${name}"]:checked`)
	if (checked.length !== 1) return null
	return checked[0].value
}

function getCorrectR() {
	const r = getCheckedValue('r')
	if (r === null || !correctR.includes(r)) {
		return 5
	}
	return parseFloat(r)
}

function XtoCanvas(x, R) {
	return centerX + x * pxPerWidthR(R)
}

function YtoCanvas(y, R) {
	return centerY - y * pxPerWidthR(R)
}

function drawCoordinate() {
	try {
		const r = getCorrectR()
		const noR = getCheckedValue('r') === null
		let R = noR ? 'R' : r
		let halfR = noR ? 'R/2' : r / 2
		const scale = pxPerWidthR(r)
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.strokeStyle = blueCol
		ctx.fillStyle = blueCol
		ctx.beginPath()
		ctx.moveTo(centerX, centerY)
		ctx.arc(centerX, centerY, r * scale, 1.5 * Math.PI, 2 * Math.PI)
		ctx.closePath()

		ctx.rect(centerX - (r / 2) * scale, centerY - r * scale, (r / 2) * scale, r * scale)

		ctx.moveTo(centerX, centerY)
		ctx.lineTo(centerX - (r / 2) * scale, centerY)
		ctx.lineTo(centerX, centerY + r * scale)
		ctx.closePath()
		ctx.fill()
		ctx.stroke()

		ctx.strokeStyle = '#000000'
		ctx.lineWidth = 1

		ctx.beginPath()
		ctx.moveTo(0, centerY)
		ctx.lineTo(canvas.width, centerY)
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(centerX, canvas.height)
		ctx.lineTo(centerX, 0)
		ctx.stroke()

		ctx.fillStyle = 'black'
		ctx.font = '16px Arial'
		ctx.textBaseline = 'middle'

		ctx.fillText('y', centerX + 4, 10)
		ctx.fillText('x', canvas.width - 10, centerY - 10)

		ctx.fillText(`${R}`, centerX + 4, centerY - Math.abs(r) * scale)
		ctx.fillText(`${halfR}`, centerX + 4, centerY - Math.abs(r) * scale * 0.5)

		ctx.fillText(`-${R}`, centerX + 4, centerY + Math.abs(r) * scale)
		ctx.fillText(`-${halfR}`, centerX + 4, centerY + Math.abs(r) * scale * 0.5)

		ctx.fillText(`${R}`, centerX + Math.abs(r) * scale, centerY - 10)
		ctx.fillText(`${halfR}`, centerX + Math.abs(r) * scale * 0.5, centerY - 10)

		ctx.fillText(`-${R}`, centerX - Math.abs(r) * scale, centerY - 10)
		ctx.fillText(`-${halfR}`, centerX - Math.abs(r) * scale * 0.5, centerY - 10)

		const lineSize = 5
		ctx.beginPath()
		ctx.moveTo(centerX - lineSize, centerY - Math.abs(r) * scale)
		ctx.lineTo(centerX + lineSize, centerY - Math.abs(r) * scale)

		ctx.moveTo(centerX - lineSize, centerY - Math.abs(r) * scale * 0.5)
		ctx.lineTo(centerX + lineSize, centerY - Math.abs(r) * scale * 0.5)

		ctx.moveTo(centerX - lineSize, centerY + Math.abs(r) * scale)
		ctx.lineTo(centerX + lineSize, centerY + Math.abs(r) * scale)

		ctx.moveTo(centerX - lineSize, centerY + Math.abs(r) * scale * 0.5)
		ctx.lineTo(centerX + lineSize, centerY + Math.abs(r) * scale * 0.5)

		ctx.moveTo(centerX + Math.abs(r) * scale, centerY - lineSize)
		ctx.lineTo(centerX + Math.abs(r) * scale, centerY + lineSize)

		ctx.moveTo(centerX + Math.abs(r) * scale * 0.5, centerY - lineSize)
		ctx.lineTo(centerX + Math.abs(r) * scale * 0.5, centerY + lineSize)

		ctx.moveTo(centerX - Math.abs(r) * scale, centerY - lineSize)
		ctx.lineTo(centerX - Math.abs(r) * scale, centerY + lineSize)

		ctx.moveTo(centerX - Math.abs(r) * scale * 0.5, centerY - lineSize)
		ctx.lineTo(centerX - Math.abs(r) * scale * 0.5, centerY + lineSize)
		ctx.stroke()

		const arrowSize = 5
		ctx.beginPath()
		ctx.moveTo(canvas.width, centerY)
		ctx.lineTo(canvas.width - arrowSize, centerY - arrowSize)
		ctx.lineTo(canvas.width - arrowSize, centerY + arrowSize)
		ctx.closePath()
		ctx.fill()

		ctx.beginPath()
		ctx.moveTo(centerX, 0)
		ctx.lineTo(centerX - arrowSize, arrowSize)
		ctx.lineTo(centerX + arrowSize, arrowSize)
		ctx.closePath()
		ctx.fill()
	} catch (err) {
		console.error('Ошибка:', err)
	}
}

function validateForms() {
	let flag = true
	const X = getCheckedValue('x')
	if (X === null) {
		showError('Выберите значение X', errorX)
		flag = false
	} else if (!correctX.includes(X)) {
		showError(`Некорректное значение X: ${X}`, errorX)
		flag = false
	}

	const Y = coord_Y.value.replace(',', '.')
	const valueY = parseFloat(Y)
	if (isNaN(valueY) || valueY <= -y_limit || valueY >= y_limit) {
		showError(`Должно быть -3<Y<3. Y=${coord_Y.value}`, errorY)
		flag = false
	}

	const checkedR = document.querySelectorAll('input[name="r"]:checked')
	const R = getCheckedValue('r')
	if (checkedR.length === 0) {
		showError('Выберите значение R', errorR)
		flag = false
	} else if (checkedR.length > 1) {
		showError('Выберите только одно значение R', errorR)
		flag = false
	} else if (!correctR.includes(R)) {
		showError(`Некорректное значение R: ${R}`, errorR)
		flag = false
	}
	if (!flag) {
		return null
	}
	return { x: X, y: Y, r: R }
}

async function sendRequest(method, params) {
	const options = { method }
	if (params) {
		options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
		options.body = new URLSearchParams(params).toString()
	}
	let response
	try {
		response = await fetch(URL, options)
	} catch {
		throw new Error('Сервер недоступен')
	}

	if (response.status === 503) {
		throw new Error('Сервер временно недоступен (HTTP 503)')
	}

	try {
		return await response.json()
	} catch {
		throw new Error(`Сервер вернул некорректный ответ (HTTP ${response.status})`)
	}
}

function showServerErrors(data) {
	if (data.errorX) showError(`Сервер: ${data.errorX}`, errorX)
	if (data.errorY) showError(`Сервер: ${data.errorY}`, errorY)
	if (data.errorR) showError(`Сервер: ${data.errorR}`, errorR)
	if (data.error) showError(`Сервер: ${data.error}`, errorServer)
}

function saveResultsLocalSt() {
	try {
		localStorage.setItem(storage_name, JSON.stringify(resultsCheckedObjects))
	} catch (err) {
		console.error('Ошибка сохранения объектов в LocalStorage:', err)
	}
}

function loadResults() {
	try {
		const storageObjects = localStorage.getItem(storage_name)
		if (storageObjects) {
			resultsCheckedObjects = JSON.parse(storageObjects)
		}
	} catch (err) {
		console.error('Ошибка загрузки объектов из LocalStorage:', err)
	}
}

function setResults(results) {
	resultsCheckedObjects = results
	saveResultsLocalSt()
	showResults()
}

function showResults() {
	let objectsHtml = ''

	for (let i = 0; i < resultsCheckedObjects.length; i++) {
		const obj = resultsCheckedObjects[i]
		objectsHtml += `
		<tr>
			<td>${obj.num}</td>
			<td>${obj.x}</td>
			<td>${obj.y}</td>
			<td>${obj.r}</td>
			<td>${obj.hit ? 'Да' : 'Нет'}</td>
			<td>${new Date(obj.time).toLocaleString('ru-RU')}</td>
			<td>${obj.execTimeNs} нс</td>
		</tr>`
	}
	resultTableBody.innerHTML = objectsHtml
}

forms.addEventListener('submit', async function (event) {
	event.preventDefault()
	hideErrors()
	const params = validateForms()
	if (!params) return

	submitButton.disabled = true
	try {
		const data = await sendRequest('POST', params)
		if (!data.results) {
			showServerErrors(data)
			return
		}
		setResults(data.results)

		const last = resultsCheckedObjects[0]
		drawCoordinate()
		drawPoint(last.x, last.y, last.r, last.hit)
	} catch (err) {
		showError(err.message, errorServer)
	} finally {
		submitButton.disabled = false
	}
})

function drawPoint(x, y, r, isHit) {
	const X = XtoCanvas(x, r)
	const Y = YtoCanvas(y, r)

	ctx.beginPath()
	ctx.strokeStyle = 'black'
	ctx.lineWidth = Math.max(1, 0.02 * pxPerWidthR(r))
	ctx.arc(X, Y, Math.max(3, 0.1 * pxPerWidthR(r)), 0, Math.PI * 2)
	ctx.fillStyle = isHit ? '#00ff15' : '#ff0000'
	ctx.fill()
	ctx.stroke()
}

function ChangeR() {
	const checkedR = document.querySelectorAll('input[name="r"]:checked')
	if (checkedR.length > 1) {
		showError('Выберите только одно значение R', errorR)
	} else {
		hideError(errorR)
	}
	drawCoordinate()
}

for (const checkbox of checkboxesR) {
	checkbox.addEventListener('change', ChangeR)
}

document.addEventListener('DOMContentLoaded', async function () {
	drawCoordinate()
	loadResults()
	showResults()
	try {
		const data = await sendRequest('GET')
		if (data.results) {
			setResults(data.results)
		}
	} catch (err) {
		console.error('Не удалось загрузить результаты с сервера:', err)
	}
})

document.getElementById('clearButton').addEventListener('click', async function () {
	hideErrors()
	try {
		const data = await sendRequest('DELETE')
		if (!data.results) {
			showServerErrors(data)
			return
		}
		setResults(data.results)
	} catch (err) {
		showError(err.message, errorServer)
		return
	}
	drawCoordinate()
})

function showError(errStr, elem) {
	elem.textContent = errStr
	elem.setAttribute('class', 'error-message visible')
}

function hideError(elem) {
	elem.setAttribute('class', 'error-message')
}

function hideErrors() {
	hideError(errorX)
	hideError(errorY)
	hideError(errorR)
	hideError(errorServer)
}
