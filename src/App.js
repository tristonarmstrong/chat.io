import React from 'react';
import './App.css';
import io from 'socket.io-client'
import Peer from 'simple-peer'
// let url = 'https://cum-io.herokuapp.com/'
let url = 'http://localhost:3000'


class App extends React.Component {

  constructor(props) {
    super(props)
    this.client = {}
    this.socket = io(url)
    this.video = null
    this.srcObject = null
    this.state = {
      my_msg: '',
      messages: [],
      NAME: ''
    }
    this.streamConstraints = {
      video: { width: window.innerWidth, height: window.innerHeight },
      audio: true
    }
  }

  activateStream() {
    let { client, socket } = this
    this.video = document.querySelector('#main')
    let video = this.video
    navigator.mediaDevices.getUserMedia(this.streamConstraints)
      .then(stream => {
        socket.emit('NewClient')
        this.srcObject = stream
        let temp = this.srcObject
        video.srcObject = this.srcObject
        video.play()


        // used to initialize a peer
        function InitPeer(type) {
          let peer = new Peer({ initiator: type === 'init' ? true : false, stream: temp, trickle: false })
          peer.on('stream', stream => {
            CreateVideo(stream)
          })
          peer.on('close', () => {
            document.getElementById('peerVideo').remove()
            peer.destroy()
          })
          return peer
        }

        // for peer of type init
        function MakePeer() {
          client.gotAnswer = false
          let peer = InitPeer('init')
          peer.on('signal', data => {
            if (!client.gotAnswer) socket.emit('Offer', data)
          })
          // other person
          client.peer = peer
        }

        // for peer of type not init
        function FrontAnswer(offer) {
          let peer = InitPeer('notInit')
          peer.on('signal', data => socket.emit('Answer', data))
          peer.signal(offer)
        }

        const SignalAnswer = (answer) => {
          client.gotAnswer = true
          let peer = client.peer
          peer.signal(answer)
        }

        function CreateVideo(stream) {
          let video = document.createElement('video')
          video.id = 'peerVideo'
          video.className = 'tiny-vid'
          video.srcObject = stream
          // document.querySelector('#peers-list-videos').appendChild(video)
          document.querySelector('#videos-container').appendChild(video)
          video.play()
        }

        function SessionActive() {
          document.write('Session Active. Please come back later')
        }

        const Disconnect = () => {
          let video = document.querySelector('#peerVideo')
          if (video) {
            // document.querySelector('#peers-list-videos').removeChild(video)
            document.querySelector('#videos-container').removeChild(video)
          }
        }


        socket.on('BackendOffer', FrontAnswer)
        socket.on('BackendAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        socket.on('Disconnect', Disconnect)
      })
      .catch(err => console.error(err))
  }

  async getName(){
    let name = await window.prompt('Please pic a name', '')
    if(!name || !name.length) return this.getName()
    else { this.setState({NAME: name}) }
  }

  componentDidMount() {
    this.getName()
    this.activateStream()
    // receiving message
    this.socket.on('message', (message) => this.addMessage(message))
  }

  handleMsgChange = (e) => this.setState({ my_msg: e.target.value })

  sendMessage = (e) => {
    e.preventDefault()
    this.socket.emit('message', {id: this.state.NAME, msg: this.state.my_msg})
    this.addMessage({msg: this.state.my_msg})
    this.setState({my_msg: ''})
  }
  addMessage = (msg) => {
    this.setState({ messages: [...this.state.messages, msg]})
    this.scrollMessage()
  }
  scrollMessage = () => {
    let c = document.querySelector('#message-container')
    c.scrollTo(0, c.scrollHeight)
  }

  disableCam = () => {
    if(!this.video.srcObject) {
      // theres gotta be a better way
      navigator.mediaDevices.getUserMedia(this.streamConstraints).then(stream => {
        this.video.srcObject = stream
        this.srcObject = stream
        this.video.play()
      }).catch(err => console.error(err))
    }
    else {
      this.srcObject.getVideoTracks().forEach(x => { this.track = x; x.stop() })
      this.video.srcObject = null
    }
  }

  messageBox = (msg) => {
    return (
      <div className={`msg-cont ${msg.id ? '' : 'me'}`}>
        <h4 className='msg-name'>{msg.id? msg.id + ':' : ''}</h4>
        <p className='msg-txt'>{msg.msg}</p>
      </div>
    )
  }

  render() {
    return (
      <div className="App">
        <h1 id="title">Socket.io Chat App</h1>
        <div id='app-container'>

          <aside id="message-sidebar">
            <div id="message-container">
              {this.state.messages.map(msg => this.messageBox(msg))}
            </div>
            <div id="msg-box">
              <form onSubmit={(e) => this.sendMessage(e)}>
                <input placeholder="chat here..." value={this.state.my_msg} onChange={(e) => this.handleMsgChange(e)} />
                <button>Send</button>
              </form>
            </div>
          </aside>

          <div id='videos-container'>
            {/* Focused video goes here */}
          </div>

          <aside id='peers-video-container'>
            <div id="user-video-container">
              <video id='main' className="tiny-vid" muted controls={false}></video>
              <span onClick={this.disableCam} class="material-icons cam-pos">
                videocam
              </span>
            </div>
            <div id="peers-list-videos">
              {/*peer videos will be pasted here*/}
            </div>
          </aside>

        </div>
      </div>
    );
  }
}

export default App;
