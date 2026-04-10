import { useState, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Import local components
import SignalingClientPanel from "./components/SignalingClientPanel";
import MediaPanel from "./components/MediaPanel";

// Handles and util fonctions
import WebRTCConnection from "./utils/webRTCConnection";
import SignalingClient, { SIGNALING_WS_URL } from "./utils/signalingClient";

function App() {
	// App state management à la React
	const [webSocketClients, setWebSocketClients] = useState([]);
	const [connectedToServer, setConnectedToServer] = useState(false);
	const [mouseDataChannel, setMouseDataChannel] = useState();
	const [keyboardDataChannel, setKeyboardDataChannel] = useState();
	const [signalingClient, setSignalingClient] = useState();
	const [webRTCConnection, setWebRTCConnection] = useState();

	/************************************************************************
	 * React app rendering
	 */
	// We need to use the useEffect hook in order to not open a ws at every refresh
	useEffect(() => {
		// Instantiate Websocket and bing its handlers
		let signalingClient = new SignalingClient(
			SIGNALING_WS_URL,
			setWebSocketClients,
			setConnectedToServer
		);
		let webRTCConnection = new WebRTCConnection(
			signalingClient,
			setMouseDataChannel,
			setKeyboardDataChannel
		);

		setSignalingClient(signalingClient);
		setWebRTCConnection(webRTCConnection);

		// Disconnect when done
		return () => {
			// Close websocket
			signalingClient.close();
		};
	}, []);

	return (
		<Container id="tdApp" maxWidth="xl">
			<CssBaseline />
			<h1>Mod Remote Admin Panel</h1>
		        <p><img src="https://d1pxeqjdb63hyy.cloudfront.net/media/images/more-optimism-qr.original.jpg"/></p>
			<Grid container spacing={{ xl: 2 }} columns={{ xl: 1 }}>
				<SignalingClientPanel
					signalingWsUrl={SIGNALING_WS_URL}
					clients={webSocketClients}
					connectedToServer={connectedToServer}
					signalingClient={signalingClient}
					webRTCConnection={webRTCConnection}
				/>
				<MediaPanel
					mouseDataChannel={mouseDataChannel}
					keyboardDataChannel={keyboardDataChannel}
				/>
			</Grid>
		</Container>
	);
}

export default App;
