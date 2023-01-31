import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Grid, Typography } from "@mui/material";

export default function RoomJoinPage() {
	const navigate = useNavigate();

	const [roomCode, setRoomCode] = useState("");
	const [error, setError] = useState("");

	function handleTextFieldChange(e) {
		setRoomCode(e.target.value);
	}

	function handleJoinRoom() {
		const reqOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: roomCode,
			}),
		};
		fetch("/api/joinRoom", reqOptions).then((res) => {
			if (res.ok) {
				navigate("/room/" + roomCode);
			} else {
				setError("Room not found");
			}
		});
	}

	return (
		<>
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Typography variant="h4" component="h4">
						Join a room
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<TextField
						error={error}
						label="Code"
						placeholder="Enter room code"
						defaultValue={roomCode}
						helperText={error}
						variant="outlined"
						onChange={handleTextFieldChange}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					<Button variant="contained" color="primary" onClick={handleJoinRoom}>
						Join Room
					</Button>
				</Grid>
				<Grid item xs={12} align="center">
					<Button variant="contained" color="secondary" to="/" component={Link}>
						Back
					</Button>
				</Grid>
			</Grid>
		</>
	);
}
