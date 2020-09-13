const socket = io()


//Elements
const $messageForm = document.querySelector('#send-forms')
const $messageFormInput = $messageForm.querySelector('#chatContent')
const $messageFormButton = $messageForm.querySelector('#submit')
const $sendlocationbtn = document.querySelector('#sendLocation')
const $message = document.querySelector('#message')
const $loc = document.querySelector('#Location')

//templates
const messageTemp = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
socket.on('MESSAGE', (message) => {
    const html = Mustache.render(messageTemp, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $message.insertAdjacentHTML('beforeend', html)
})

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

const locTemp = document.querySelector('#LocShare').innerHTML
socket.on('shareLoc', (loc) => {
    const html = Mustache.render(locTemp, {
        username: loc.username,
        loc: loc.url,
        createdAt: moment(loc.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const text = e.target.chat.value
    socket.emit('INCOMING', text, (text) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

$sendlocationbtn.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('your browser doesn')
    }
    $sendlocationbtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = (position.coords)
        socket.emit('coord', { latitude, longitude }, () => {
            console.log('location shared')
            $sendlocationbtn.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})