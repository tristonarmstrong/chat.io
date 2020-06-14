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
    this.state = {
      my_msg: '',
      messages: []
    }
    this.streamConstraints = {
      video: { width: window.innerWidth, height: window.innerHeight },
      audio: true
    }
  }



  componentDidMount() {
    let { client, socket } = this
    let video = document.querySelector('#main')
    navigator.mediaDevices.getUserMedia(this.streamConstraints)
      .then(stream => {
        socket.emit('NewClient')
        video.srcObject = stream
        video.play()


        // used to initialize a peer
        function InitPeer(type) {
          let peer = new Peer({ initiator: type === 'init' ? true : false, stream: stream, trickle: false })
          peer.on('stream', stream => {
            console.log('streaming')
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
          console.log('making peer')
          client.gotAnswer = false
          let peer = InitPeer('init')
          console.log(peer)
          peer.on('signal', data => {
            console.log(data)
            if (!client.gotAnswer) socket.emit('Offer', data)
          })
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
          console.log('create Video')
          let video = document.createElement('video')
          video.id = 'peerVideo'
          video.className = 'tiny-vid'
          video.srcObject = stream
          document.querySelector('#peers-list-videos').appendChild(video)
          video.play()
        }

        function SessionActive() {
          document.write('Session Active. Please come back later')
        }

        const Disconnect = () => {
          console.log(client)
          console.log('disconnecting')
          let video = document.querySelector('#peerVideo')
          if (video) {
            document.querySelector('#peers-list-videos').removeChild(video)
          }
        }


        socket.on('BackendOffer', FrontAnswer)
        socket.on('BackendAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        socket.on('Disconnect', Disconnect)
      })
      .catch(err => document.write(err))
  }

  handleMsgChange = (e) => this.setState({ my_msg: e.target.value })
  sendMessage = (e) => {
    e.preventDefault()
    this.setState({ messages: [...this.state.messages, { name: 'Triston', msg: this.state.my_msg }], my_msg: '' })
  }
  disableCam = () => {
    navigator.mediaDevices.getUserMedia(this.streamConstraints)
    .then(stream => {
      stream.getVideoTracks().forEach(track => {
        console.log(track)
        track.stop()
      })
    })
    .catch(err => console.error(err))
  }

  render() {
    return (
      <div className="App">
        <h1 id="title">Socket.io Chat App</h1>
        <div id='app-container'>

          <aside id="message-sidebar">
            <h3>Messages</h3>
            <div id="message-container">
              {this.state.messages.map(msg =>
                <div className="msg-cont">
                  <h4>{msg.name}</h4>
                  <p>{msg.msg}</p>
                </div>)}
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
            <h3>Me</h3>
            <div id="user-video-container">
              <video id='main' className="tiny-vid" muted controls={false}></video>
              <span onClick={this.disableCam} class="material-icons cam-pos">
                videocam
              </span>
            </div>
            <hr />
            <h3>Other Bitches</h3>
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
