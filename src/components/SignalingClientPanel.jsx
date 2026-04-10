import {
	Container,
	Button,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Divider,
	Typography,
	useTheme,
	useMediaQuery,
} from "@mui/material";

function SignalingClientPanel(props) {
	// React properties passed in App.js
	const {
		clients,
		signalingWsUrl,
		connectedToServer,
		signalingClient,
		webRTCConnection,
	} = props;

	const theme = useTheme();

	const isMedium = useMediaQuery(theme.breakpoints.down("md"));
	const isLarge = useMediaQuery(theme.breakpoints.down("lg"));
	const isXLarge = useMediaQuery(theme.breakpoints.down("xl"));

	// CSS Styling
	const componentStyle = {
		backgroundColor: "darkgray",
		width: isMedium ? "100%" : isLarge ? "100%" : isXLarge ? "100%" : "20%",
	};
	const buttonStyle = {
		marginTop: 2,
	};
	const listStyle = {
		display: "inline-block",
	};
	const listItemTextStyle = {
		width: "100%",
		fontSize: "10px",
	};

	return (
		<Container id="tdSignaling" style={componentStyle}>
			<h2>Signaling server</h2>
			<Typography variant="body2" sx={{ wordBreak: "break-all", mb: 1 }}>
				{signalingWsUrl}
			</Typography>
			<Button
				variant="contained"
				id="btnConnect"
				style={buttonStyle}
				disabled={connectedToServer}
				onClick={() => signalingClient.open()}
			>
				Connect
			</Button>
			<Button
				variant="contained"
				id="btnDisconnect"
				style={buttonStyle}
				disabled={!connectedToServer}
				onClick={() => signalingClient.close()}
			>
				Disconnect
			</Button>
			<h4>Connected to server: {connectedToServer ? "Yes" : "No"}</h4>
			<Divider />
			<Container id="tdSignalingList" disableGutters>
				<h3>Signaling clients list </h3>
				<List className="clients">
					{
						// List out Websocket clients and add handlers to bind them to a Web RTC session
						clients.map((wsClient, i) => {
							const { id, address, properties } = wsClient;

							// Returns a React component to be rendered
							return (
								<ListItem key={id} style={listStyle} disableGutters>
									<ListItemText
										primary={address}
										style={listItemTextStyle}
									></ListItemText>
									<ListItemText
										secondary={id}
										style={listItemTextStyle}
									></ListItemText>
									<ListItemButton component="a">
										<ListItemText
											primary="Start"
											onClick={() =>
												webRTCConnection.onCallStart(address, properties)
											}
										></ListItemText>
									</ListItemButton>
									<ListItemButton component="a">
										<ListItemText
											primary="End"
											onClick={() => webRTCConnection.onCallEnd()}
										></ListItemText>
									</ListItemButton>
								</ListItem>
							);
						})
					}
				</List>
			</Container>
		</Container>
	);
}

export default SignalingClientPanel;
