'use strict'

let tempo = 60
let isPlaying = false
let lookahead = 25
let scheduleAheadTime = 0.1
let nextNoteTime = 0
let panValue = 1

const $startStop = document.querySelector('#startStop')
const $faster = document.querySelector('#faster')
const $slower = document.querySelector('#slower')
const $tempo = document.querySelector('#tempo')

const audioCtx = new AudioContext()
const panNode = audioCtx.createStereoPanner()
panNode.pan.setTargetAtTime(panValue, audioCtx.currentTime, 0)
panNode.connect(audioCtx.destination)

function loadSound (url) {

  return new Promise((resolve, reject) => {

    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      const audioData = request.response
      audioCtx.decodeAudioData(audioData, resolve, reject)
    }
    request.send()
  })
}

function playBuffer (buff, time) {
  const source = audioCtx.createBufferSource()
  source.buffer = buff
  panValue = panValue * -1
  panNode.pan.setTargetAtTime(panValue, time, 0)
  source.connect(panNode)
  source.start(time)
}

function startStop () {
  isPlaying = !isPlaying
  if (isPlaying) {
    nextNoteTime = audioCtx.currentTime
  }
  $startStop.classList.toggle('is-playing', isPlaying)
  flashButton($startStop)
}

function faster () {
  tempo += 1
  $tempo.innerHTML = String(tempo)
  flashButton($faster)
}

function slower () {
  if (tempo >= 0) {
    tempo -= 1
    $tempo.innerHTML = String(tempo)
  }
  flashButton($slower)
}

function flashButton ($btn) {
  $btn.classList.toggle('active')
  setTimeout(() => {
    $btn.classList.toggle('active')
  }, 150)
}

$startStop.addEventListener('click', startStop)
$faster.addEventListener('click', faster)
$slower.addEventListener('click', slower)

window.addEventListener('keydown', ({ keyCode }) => {
  if (keyCode === 32) {
    startStop()
  }
  if (keyCode === 38) {
    faster()
  }
  if (keyCode === 40) {
    slower()
  }
})

loadSound('sound-mono.mp3').then((sound) => {

  setInterval(() => {
    if (isPlaying) {
      if (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        playBuffer(sound, nextNoteTime)
        let bpm = 60 / tempo
        nextNoteTime += bpm
      }
    }
  }, lookahead)
})
