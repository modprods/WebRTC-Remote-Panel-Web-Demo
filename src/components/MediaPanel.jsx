import { useEffect, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import './MediaPanel.css';

function MediaPanel(props) {
    const { mouseDataChannel, keyboardDataChannel } = props;

	const shellRef = useRef(null);
	const videoRef = useRef(null);
	const redirectingFullscreenRef = useRef(false);
	const [shellIsFullscreen, setShellIsFullscreen] = useState(false);

	useEffect(() => {
		const syncFullscreen = () => {
			const fsEl =
				document.fullscreenElement ?? document.webkitFullscreenElement;
			const shell = shellRef.current;
			const video = videoRef.current;

			// If Chrome fullscreen targets the video (native path), redirect to wrapper fullscreen.
			if (fsEl === video && shell && !redirectingFullscreenRef.current) {
				redirectingFullscreenRef.current = true;
				void (async () => {
					try {
						if (document.exitFullscreen) {
							await document.exitFullscreen();
						} else if (document.webkitExitFullscreen) {
							await document.webkitExitFullscreen();
						}
						if (shell.requestFullscreen) {
							await shell.requestFullscreen();
						} else if (shell.webkitRequestFullscreen) {
							await shell.webkitRequestFullscreen();
						}
					} finally {
						redirectingFullscreenRef.current = false;
					}
				})();
				return;
			}

			setShellIsFullscreen(fsEl === shell);
		};
		document.addEventListener('fullscreenchange', syncFullscreen);
		document.addEventListener('webkitfullscreenchange', syncFullscreen);
		return () => {
			document.removeEventListener('fullscreenchange', syncFullscreen);
			document.removeEventListener('webkitfullscreenchange', syncFullscreen);
		};
	}, []);

	useEffect(() => {
		const onGlobalKeyDown = (event) => {
			if (event.repeat) return;
			if (event.ctrlKey || event.metaKey || event.altKey) return;

			const key = event.key;
			if (key !== 'f' && key !== 'F') return;

			const el = event.target;
			if (
				el instanceof HTMLInputElement ||
				el instanceof HTMLTextAreaElement ||
				el instanceof HTMLSelectElement ||
				el.closest?.('[contenteditable="true"]')
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const shell = shellRef.current;
			if (!shell) return;

			const fsEl =
				document.fullscreenElement ?? document.webkitFullscreenElement;
			const isFs = fsEl === shell;

			if (isFs) {
				void (
					document.exitFullscreen?.() ??
					document.webkitExitFullscreen?.()
				);
			} else {
				void (
					shell.requestFullscreen?.() ??
					shell.webkitRequestFullscreen?.()
				);
			}
		};

		window.addEventListener('keydown', onGlobalKeyDown, true);
		return () =>
			window.removeEventListener('keydown', onGlobalKeyDown, true);
	}, []);

	const toggleShellFullscreen = () => {
		const shell = shellRef.current;
		if (!shell) return;

		const fsEl =
			document.fullscreenElement ?? document.webkitFullscreenElement;
		const isFs = fsEl === shell;

		if (isFs) {
			void (
				document.exitFullscreen?.() ?? document.webkitExitFullscreen?.()
			);
			return;
		}

		void (
			shell.requestFullscreen?.() ?? shell.webkitRequestFullscreen?.()
		);
	};

	const componentStyle = {
        backgroundColor: 'lightGrey'
    }

	// Send data on both mouse down and move to mock interactions on TD leapPaint
	const sendMouseData = (event) => {
		if (!mouseDataChannel) {
			console.log('The dataChannel does not exist, aborting.')
			return;
		}

		var msCont = document.getElementById('remoteVideo')
		var comStyle = window.getComputedStyle(msCont, null);
		var width = parseInt(comStyle.getPropertyValue("width"), 10);
		var height = parseInt(comStyle.getPropertyValue("height"), 10);
		
		// Mouse event related to Derivatives JSON API
		let mouseEventDict = {
			lselect: event.buttons === 1 ? true : false,
			mselect: event.buttons === 4 ? true : false,
			rselect: event.buttons === 2 ? true : false,
			insideu: 1 - (event.nativeEvent.offsetX / width),
			insidev: 1 - (event.nativeEvent.offsetY / height)
		}

		if (mouseDataChannel.readyState === 'open') {
			mouseDataChannel.send(
				JSON.stringify(mouseEventDict)
			);
		}
	}

	const sendKeyboardData = (event) => {
		let keyboardEventDict = {
			type: event.type,
			key: event.key,
			code: event.code,
			location: event.location,
			repeat: event.repeat,
			isComposing: event.isComposing,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey
		}

		if (keyboardDataChannel.readyState === 'open') {
			keyboardDataChannel.send(JSON.stringify(keyboardEventDict));
		}
	}

	return <Container id="webRTCViewer" style={ componentStyle } disableGutters>
		<div ref={ shellRef } className="remote-video-shell">
			<video 
				id="remoteVideo"
				ref={ videoRef }
				autoPlay
				muted={ false }
				controls={ false }
				controlsList="nofullscreen"
				onMouseDown={ sendMouseData }
				onMouseMove={ sendMouseData }
				onMouseUp={ sendMouseData } 
				onKeyDown={ sendKeyboardData }
				tabIndex="1"
			>
			</video>
			<button
				type="button"
				className="remote-video-fs-btn"
				title={ `${shellIsFullscreen ? 'Exit' : 'Enter'} fullscreen (f)` }
				aria-label={
					shellIsFullscreen
						? 'Exit fullscreen (shortcut f)'
						: 'Enter fullscreen (shortcut f)'
				}
				aria-pressed={ shellIsFullscreen }
				onClick={ toggleShellFullscreen }
			>
				<span className="material-icons" aria-hidden="true">
					{ shellIsFullscreen ? 'fullscreen_exit' : 'fullscreen' }
				</span>
			</button>
		</div>
	</Container>; 
}

export default MediaPanel;