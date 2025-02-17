import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, Collapse } from "@mui/material";
import RoomCreateUpdatePage from "./RoomCreateUpdatePage";
import MusicPlayer from "./MusicPlayer";

const SPOTIFY_POLL_RATE = 1000;

export default function Room({ clearHomePageRoomCode }) {
	const navigate = useNavigate();

	const matchParams = useParams();
	const roomCode = matchParams.roomCode;

	const defaultNoneSong = {
		title: "No song",
		duration: 1,
		progress: 0,
		albumCover: "/static/images/noContent.png",
		isPlaying: false,
		songId: "",
		artists: "",
		type: "none",
		votes: 0,
		votesRequired: 0,
	};
	const defaultAdSong = {
		title: "Advertisement",
		duration: 1,
		progress: 0,
		albumCover: "/static/images/noContent.png",
		isPlaying: false,
		songId: "",
		artists: "",
		type: "ad",
		votes: 0,
		votesRequired: 0,
	};

	const [playbackControl, setPlaybackControl] = useState(false);
	const [skipVotes, setSkipVotes] = useState(0);
	const [isHost, setIsHost] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState(null);
	const [spotifyAuthed, setSpotifyAuthed] = useState(false);
	const [song, setSong] = useState(defaultNoneSong);

	function getRoomDetails() {
		fetch("/api/getRoom" + "?code=" + roomCode)
			.then((res) => {
				if (!res.ok) {
					clearHomePageRoomCode();
					navigate("/");
				}
				return res.json();
			})
			.then((data) => {
				setPlaybackControl(data.guestCanPause);
				setSkipVotes(data.skipVotes);
				setIsHost(data.isHost);

				return data.isHost;
			})
			.then((host) => {
				if (host) {
					authenticateSpotify();
				}
			});
	}

	function getCurrentSong() {
		fetch("/spotifyapi/getCurrentSong")
			.then((res) => res.json())
			.then((data) => {
				if (data.type == "song") setSong(data);
				else if (data.type == "none") setSong(defaultNoneSong);
				else if (data.type == "ad") setSong(defaultAdSong);
			});
	}

	function setIntervalImmediately(func, interval) {
		func();
		return setInterval(func, interval);
	}

	useEffect(() => {
		getRoomDetails();

		var songPoll = setIntervalImmediately(() => {
			getCurrentSong();
		}, SPOTIFY_POLL_RATE);

		return () => {
			clearInterval(songPoll);
		};
	}, []);

	function authenticateSpotify() {
		fetch("/spotifyapi/isAuthenticated")
			.then((res) => res.json())
			.then((data) => {
				setSpotifyAuthed(data.authenticated);
				if (!data.authenticated) {
					fetch("/spotifyapi/getAuthenticateUrl")
						.then((res) => res.json())
						.then((data) => {
							window.location.replace(data.url);
						});
				}
			});
	}

	function leaveRoom() {
		const reqOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/api/leaveRoom", reqOptions).then((res) => {
			clearHomePageRoomCode();
			navigate("/");
		});
	}

	function showToastComp(msg, timeout) {
		setToastMessage(msg);
		setShowToast(true);

		setTimeout(() => {
			setShowToast(false);
		}, timeout);
	}

	function settingsSaveCallback(success) {
		if (success) {
			setShowSettings(false);
			getRoomDetails();
			getCurrentSong();
			showToastComp("Saved", 1500);
		} else {
			showToastComp("Error saving", 2000);
		}
	}

	function renderSettingsButton() {
		return (
			<>
				<Grid item xs={12} align="center">
					<Button
						variant="contained"
						color="primary"
						onClick={() => setShowSettings(true)}
					>
						Settings
					</Button>
				</Grid>
			</>
		);
	}

	function renderRoomPage() {
		return (
			<>
				<Grid item xs={12} align="center">
					<Typography variant="h4" color="textSecondary" component="h4">
						{roomCode}
					</Typography>
				</Grid>
				<MusicPlayer
					song={song}
					updateRoomDetails={getCurrentSong}
					showToast={showToastComp}
				/>
				{isHost ? renderSettingsButton() : null}
				<Grid item xs={12} align="center">
					<Button variant="contained" color="secondary" onClick={leaveRoom}>
						Leave Room
					</Button>
				</Grid>
			</>
		);
	}

	function renderSettingsPage() {
		return (
			<>
				<Grid item xs={12} align="center">
					<RoomCreateUpdatePage
						update={true}
						currentProps={{
							skipVotes: skipVotes,
							playbackControl: playbackControl,
							roomCode: roomCode,
						}}
						settingsSaveCallback={settingsSaveCallback}
						updateCallback={() => {}}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						variant="contained"
						color="secondary"
						onClick={() => setShowSettings(false)}
					>
						Back
					</Button>
				</Grid>
			</>
		);
	}

	return (
		<>
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Collapse in={showToast}>
						<Typography variant="body1">{toastMessage}</Typography>
					</Collapse>
				</Grid>
				{showSettings ? renderSettingsPage() : renderRoomPage()}
			</Grid>
		</>
	);
}
