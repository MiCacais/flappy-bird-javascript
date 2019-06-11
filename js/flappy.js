function newElement (tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}
 
function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')
 
    const edge = newElement('div', 'edge')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : edge)
    this.element.appendChild(reverse ? edge : body)
 
    this.setHeight = (height) => body.style.height = `${height}px`
}
 
function CoupleOfBarriers(height, aperture, x) {
    this.element = newElement('div', 'couple-of-barriers')
 
    this.upper = new Barrier(true)
    this.down = new Barrier(false)
 
    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.down.element)
 
    this.drawAperture = () => {
        const upperHeight = Math.random() * (height - aperture)
        const downHeight = height - aperture - upperHeight
        this.upper.setHeight(upperHeight)
        this.down.setHeight(downHeight)
    }
 
    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = (x) => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth
 
    this.drawAperture()
    this.setX(x)
}

function Barriers(height, width, aperture, space, notifyScore) {
    this.couples = [
        new CoupleOfBarriers(height, aperture, width),
        new CoupleOfBarriers(height, aperture, width + space),
        new CoupleOfBarriers(height, aperture, width + space * 2),
        new CoupleOfBarriers(height, aperture, width + space * 3)
    ]

    const displacement = 3
    this.liven = () => {
        this.couples.forEach(couple => {
            couple.setX(couple.getX() - displacement)

            if(couple.getX() < -couple.getWidth()){
                couple.setX(couple.getX() + space * this.couples.length)
                couple.drawAperture()
            }
            const middle = width / 2
            const passedMiddle = couple.getX() + displacement >= middle
                && couple.getX() < middle
            if(passedMiddle) notifyScore()
        })
    }
}

function Bird(gameHeight){
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.liven = () => {
        const newY = this.getY() + (flying? 8 : -4)
        const maxHeight = gameHeight - this.element.clientHeight

        if(newY <= 0){
            this.setY(0)
        }else if(newY >= maxHeight){
            this.setY(maxHeight)
        }else{
            this.setY(newY)
        }
    }
    this.setY(gameHeight / 2)
}

function Progress(){
    this.element = newElement('span', 'progress')
    this.updateScores = scores => {
        this.element.innerHTML = scores
    }
    this.updateScores(0)
}

function overlapped(elementA, elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collided(bird, barriers){
    let collided = false
    barriers.couples.forEach(CoupleOfBarriers =>{
        if (!collided){
            const upper = CoupleOfBarriers.upper.element
            const down = CoupleOfBarriers.down.element
            collided = overlapped(bird.element, upper)
                || overlapped(bird.element, down)
        }
    })
    return collided
}

function FlappyBird(){
    let scores = 0

    const gameArea = document.querySelector('[flappy-bird]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth
    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.updateScores(++scores))
    const bird = new Bird(height)
    const modal = document.getElementById('modal')

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.couples.forEach(couple => gameArea.appendChild(couple.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.liven()
            bird.liven()

            if (collided(bird, barriers)){
                clearInterval(timer)
                modal.style.display = "block"
            }
        }, 20)
    }

    this.clean = () => {
        while (gameArea.firstChild) {
            gameArea.removeChild(gameArea.firstChild);
        }
        modal.style.display = "none"
    }
}

function startGame() {
    const flappyBird = new FlappyBird()
    flappyBird.start()
}

function restartGame() {
    const flappyBird = new FlappyBird()
    flappyBird.clean()
    startGame()
}

startGame()
