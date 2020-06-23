import React from 'react';
import './App.css';
import io from 'socket.io-client'
import Peer from 'simple-peer'
import axios from 'axios'
// let url = 'http://localhost:5000'
let url = process.env.REACT_APP_API_URL

/*

ITS FUCKING SPAGHETTI CODE, I KNOW, LEAVE ME THE HELL
ALONE YOU GOD DAMN SIMPLETONS 

kidding I<3U

*/



class App extends React.PureComponent {

  constructor(props) {
    super(props)
    this.video = null
    this.srcObject = null
    this.peers = { /* index, answer, peer_obj */ }
    this.state = {
      my_msg: '',
      messages: [],
      NAME: ''
    }
    this.streamConstraints = {
      video: { width: 854, height: 480 },
      audio: true
    }
  }

  componentDidMount() {
    // initialize socket
    this.socket = io(`${url}${window.location.pathname}`, { transports: ['websocket'], upgrade: false }).once('connect')
    // create room on server from pathname
    axios.get(`${url}${window.location.pathname}`)
      .then(res => res).catch(err => console.error(err))
    // user input for name
    this.getName()
    // start stream
    this.activateStream()
    // receiving messages
    this.socket.on('message', (message) => this.addMessage(message))
  }


  activateStream() {
    let { socket, video, streamConstraints, srcObject, peers } = this
    video = document.querySelector('#main')
    this.video = video

    // ======= GETTING CAM STREAM START HERE =========
    navigator.mediaDevices.getUserMedia(streamConstraints)
      .then(stream => {
        socket.emit('NewClient') // tell the others on the server that youre a new client
        srcObject = stream // store this for later cam toggle
        this.srcObject = stream
        let temp = srcObject // store this for use in peers
        video.srcObject = srcObject // set new video elem's srcObject to cam stream
        video.play() // play stream


        // used to create a peer
        const InitPeer = (type, id) => {
          console.log('%ccreating peer of type: ', 'color:orange', type, ' : ', id)
          let peer = new Peer({ initiator: type === 'init' ? true : false, stream: temp, trickle: false })
          peers[id] = { id, peer, gotAnswer: false }
          // ---- peer events ----
          peer.on('stream', stream => { CreateVideo(stream, id) })
          peer.on('error', err => console.error('Custom error response -> ', { code: err.code, error: err }))
          peer.on('close', () => { peer.destroy() })
          // -- completed --
          console.log('peer has been created')
          return peer
        }

        // for peer of type init
        const MakePeer = (socket_id, client_id) => {
          console.log('%cOk i am making a peer for: ', 'color:green', client_id)
          // -- create a peer --
          let peer = InitPeer('init', client_id)
          // -- send peer signal data (offer)
          peer.on('signal', data => {
            if (!peers[client_id].gotAnswer) socket.emit('Offer', data, socket_id)
          })
        }

        // for peer of type not init
        const FrontAnswer = (offer, socket_id, client_id) => {
          console.log('%cHey I got the offer!', 'color:cyan')
          // -- create peer for this client --
          let peer = InitPeer('notInit', client_id)
          console.log('Sending answer')
          // -- send peer data answer --
          peer.on('signal', data => socket.emit('Answer', data, socket_id))
          console.log('connecting peer data')
          // -- set incoming peer offer to this peers signal for connection --
          peer.signal(offer)
        }

        const SignalAnswer = (answer, client_id) => {
          if (answer.renegotiate) {
            // -- display this message on renegotiatev --
            console.log('%cSorry we have to renegotiate', 'color:red', ' -> Trying again')
          } else {
            // -- successfully received an answer --
            peers[client_id].gotAnswer = true // set answer for this peer
            let peer = peers[client_id].peer
            // -- set incoming peer offer to this peers signal for connection --
            peer.signal(answer)
            console.log('%cI got your answer, ', 'color:cyan', client_id, ' : ', answer)
          }
        }

        const CreateVideo = (stream, peer_id) => {
          if (document.querySelector(`#peerVideo-${peer_id}`)) {
            // -- break from this method if the video already exists -- 
            return
          }
          // -- create a video elem and assign stream to src -- 
          let video = document.createElement('video')
          video.id = `peerVideo-${peer_id}`
          video.className = 'tiny-vid'
          video.onclick = (e) => this.makeFocused(e)
          video.srcObject = stream
          let focused_container = document.querySelector('#focused-video-container')
          let focused_video = focused_container.children[0]
          if(focused_video){
            focused_container.replaceChild(video, focused_video)
            if(focused_video.id === 'main'){
              document.querySelector('#user-video-container').prepend(focused_video)
            }
            else{
              document.querySelector('#peers-list-videos').appendChild(focused_video)
            }
          }
          // document.querySelector('#peers-list-videos').appendChild(video)
          video.play()
        }

        const Disconnect = (client_id) => {
          // -- remove the peers video elem from dom when they leave --
          let video = document.querySelector(`#peerVideo-${client_id}`)
          if (video) {
            video.parentElement.removeChild(video)
          }
        }


        socket.on('CreatePeer', MakePeer) // i send
        socket.on('BackendOffer', FrontAnswer) // they send
        socket.on('BackendAnswer', SignalAnswer) // i send
        socket.on('Disconnect', Disconnect)
      })
      .catch(err => console.error(err))

    // ========== END CAM STREAM HERE =============
  }



  //====================================================
  //====================================================
  //====================================================
  //====================================================
  //====================================================




  // ========== USER PROMPT METHODS ==============

  async getName() {
    // -- prompt user for name for state storage --
    let name = await window.prompt('Please pic a name', '')
    if (!name || !name.length) return this.getName()
    else { this.setState({ NAME: name }) }
  }


  // ========= MESSAGES METHODS =============

  handleMsgChange = (e) => this.setState({ my_msg: e.target.value }) // -- updates messages --

  sendMessage = (e) => {
    // -- emit a socket event and send my name with my message
    e.preventDefault()
    this.socket.emit('message', { id: this.state.NAME, msg: this.state.my_msg })
    // -- add my message to message list without my name --
    this.addMessage({ msg: this.state.my_msg })
    // -- reset my message --
    this.setState({ my_msg: '' })
  }

  addMessage = (msg) => {
    this.setState({ messages: [...this.state.messages, msg] })
    this.scrollMessage()
  }
  scrollMessage = () => {
    let c = document.querySelector('#message-container')
    c.scrollTo(0, c.scrollHeight)
  }

  messageBox = (msg, i) => {
    return (
      <div key={i} className={`msg-cont ${msg.id ? '' : 'me'}`}>
        <h4 className='msg-name'>{msg.id ? msg.id + ':' : ''}</h4>
        <p className='msg-txt'>{msg.msg}</p>
      </div>
    )
  }




  // ========== CAM METHOD ============


  disableCam = () => {
    if (!this.video.srcObject) {
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

  makeFocused = (e) => {
    let video = e.target
    let focused_container = document.querySelector('#focused-video-container')
    let peers_container = document.querySelector('#peers-list-videos')
    let focused_video = focused_container.children[0]
    console.log(focused_video)
    if(focused_video){
      focused_container.replaceChild(video, focused_video)
      peers_container.appendChild(focused_video)
    }else{
      focused_container.appendChild(video)
    }
  }


  render() {
    return (
      <div className="App">
        <h1 id="title">Socket.io Chat App</h1>
        <div id='app-container'>

          <aside id="message-sidebar">
            <div id="message-container">
              {this.state.messages.map((msg, i) => this.messageBox(msg, i))}
            </div>
            <div id="msg-box">
              <form onSubmit={(e) => this.sendMessage(e)}>
                <input placeholder="chat here..." value={this.state.my_msg} onChange={(e) => this.handleMsgChange(e)} />
                <button>Send</button>
              </form>
            </div>
          </aside>

          <div id='focused-video-container'>
            {/* Focused video goes here */}
            <video id='main' className="tiny-vid" muted controls={false}></video>
          </div>

          <aside id='peers-video-container'>
            <div id="user-video-container">
              {/* main video will be pasted here */}
              <span onClick={this.disableCam} className="material-icons cam-pos">
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
