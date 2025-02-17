import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Button,
	Grid,
	Typography,
	TextField,
	FormHelperText,
	FormControl,
	Radio,
	RadioGroup,
	FormControlLabel,
} from "@mui/material";

export default function RoomCreateUpdatePage({
	update,
	currentProps,
	settingsSaveCallback,
}) {
	const navigate = useNavigate();

	var defaultPlaybackControl = true;
	var defaultVotes = 2;
	var roomCode = null;
	if (update) {
		defaultPlaybackControl = currentProps.playbackControl;
		defaultVotes = currentProps.skipVotes;
		roomCode = currentProps.roomCode;
	}

	const [playbackControl, setPlaybackControl] = useState(
		defaultPlaybackControl
	);
	const [skipVotes, setSkipVotes] = useState(defaultVotes);

	function handlePlaybackControlChange(e) {
		setPlaybackControl(e.target.value === "true");
	}

	function handleVotesChange(e) {
		setSkipVotes(e.target.value);
	}

	function handleCreateRoom() {
		const reqOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				guestCanPause: playbackControl,
				skipVotes: skipVotes,
			}),
		};
		fetch("/api/createRoom", reqOptions)
			.then((res) => res.json())
			.then((data) => navigate("/room/" + data.code));
	}

	function handleUpdateRoom() {
		const reqOptions = {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				guestCanPause: playbackControl,
				skipVotes: skipVotes,
				code: roomCode,
			}),
		};
		fetch("/api/updateRoom", reqOptions).then((res) => {
			settingsSaveCallback(res.ok);
		});
	}

	return (
		<>
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Typography component="h4" variant="h4">
						{update ? "Update Room: " + roomCode : "Create Room"}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<FormControl component="fieldset">
						<FormHelperText>
							<div align="center">Guest Control</div>
						</FormHelperText>
						<RadioGroup
							row
							defaultValue={defaultPlaybackControl}
							onChange={handlePlaybackControlChange}
						>
							<FormControlLabel
								value="true"
								control={<Radio color="primary" />}
								label="Play/Pause"
								labelPlacement="bottom"
							/>
							<FormControlLabel
								value="false"
								control={<Radio color="secondary" />}
								label="No Control"
								labelPlacement="bottom"
							/>
						</RadioGroup>
					</FormControl>
				</Grid>
				<Grid item xs={12} align="center">
					<FormControl>
						<TextField
							required={true}
							type="number"
							defaultValue={defaultVotes}
							inputProps={{
								min: 1,
								style: { textAlign: "center" },
							}}
							onChange={handleVotesChange}
						/>
						<FormHelperText>
							<div align="center">Votes To Skip</div>
						</FormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={update ? handleUpdateRoom : handleCreateRoom}
					>
						{update ? "Save Changes" : "Create Room"}
					</Button>
				</Grid>
				{update ? null : (
					<Grid item xs={12} align="center">
						<Button
							color="secondary"
							variant="contained"
							to="/"
							component={Link}
						>
							Back
						</Button>
					</Grid>
				)}
			</Grid>
		</>
	);
}
