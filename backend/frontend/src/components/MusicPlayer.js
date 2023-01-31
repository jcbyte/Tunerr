import React, { useState } from "react";
import {
	Grid,
	Typography,
	Card,
	IconButton,
	LinearProgress,
	Icon,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

export default function MusicPlayer({ song, updateRoomDetails, showToast }) {
	function playPauseSong(play) {
		const reqOptions = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				play: play,
			}),
		};
		fetch("/spotifyapi/playPauseSong", reqOptions).then((res) => {
			if (res.ok) updateRoomDetails();
			else if (res.status == 403) showToast("Guest playback disabled", 1500);
			else if (res.status == 402) showToast("Host needs Premium", 1500);
		});
	}

	function skipSong() {
		const reqOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotifyapi/skipSong", reqOptions).then((res) => {
			if (res.ok) updateRoomDetails();
			else if (res.status == 402) showToast("Host needs Premium", 1500);
		});
	}

	return (
		<>
			<Card style={{ "background-color": "rgba(102, 102, 136, 0.4)" }}>
				<Grid container alignItems="center">
					<Grid item align="center" xs={4}>
						<img src={song.albumCover} height="100%" width="100%" />
					</Grid>
					<Grid item align="center" xs={8}>
						<Typography component="h5" variant="h5">
							{song.title}
						</Typography>
						<Typography color="textSecondary" variant="subtitle1">
							{song.artists}
							<div>
								<IconButton onClick={() => playPauseSong(!song.isPlaying)}>
									{song.isPlaying ? <Pause /> : <PlayArrow />}
								</IconButton>
								<IconButton onClick={skipSong}>
									<SkipNext /> {song.votes} / {song.votesRequired}
								</IconButton>
							</div>
						</Typography>
					</Grid>
				</Grid>
				<LinearProgress
					variant="determinate"
					value={(song.progress / song.duration) * 100}
				/>
			</Card>
		</>
	);
}
