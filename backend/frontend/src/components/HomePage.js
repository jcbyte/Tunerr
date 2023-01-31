import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";

import RoomJoinPage from "./RoomJoinPage";
import RoomCreateUpdatePage from "./RoomCreateUpdatePage";
import Room from "./Room";

export default function HomePage() {
	const [roomCode, setRoomCode] = useState(null);

	useEffect(() => {
		fetch("/api/userInRoom")
			.then((res) => res.json())
			.then((data) => {
				setRoomCode(data.code);
			});
	}, []);

	function clearHomePageRoomCode() {
		setRoomCode(null);
	}

	function renderHomePage() {
		return (
			<>
				<Grid container spacing={3}>
					<Grid item xs={12} align="center">
						<Typography variant="h3" component="h3">
							Tuneʳʳ
						</Typography>
					</Grid>
					<Grid item xs={12} align="center">
						<ButtonGroup disableElevation variant="contained" color="primary">
							<Button color="primary" to="/join" component={Link}>
								Join room
							</Button>
							<Button color="secondary" to="/create" component={Link}>
								Create room
							</Button>
						</ButtonGroup>
					</Grid>
				</Grid>
			</>
		);
	}

	return (
		<>
			<Router>
				<Routes>
					<Route
						exact
						path="/"
						element={
							roomCode ? (
								<Navigate to={"/room/" + roomCode} />
							) : (
								renderHomePage()
							)
						}
					/>
					<Route path="/join" element={<RoomJoinPage />} />
					<Route
						path="/create"
						element={<RoomCreateUpdatePage update={false} />}
					/>
					<Route
						path="/room/:roomCode"
						element={<Room clearHomePageRoomCode={clearHomePageRoomCode} />}
					/>
				</Routes>
			</Router>
		</>
	);
}
