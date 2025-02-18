import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import HomePage from "./HomePage";

import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Room from "./Room";
import RoomCreateUpdatePage from "./RoomCreateUpdatePage";
import RoomJoinPage from "./RoomJoinPage";

export default function App() {
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

	return (
		<>
			<div className="center">
				<Router>
					<Routes>
						<Route exact path="/" element={roomCode ? <Navigate to={"/room/" + roomCode} /> : <HomePage />} />
						<Route path="/join" element={<RoomJoinPage />} />
						<Route path="/create" element={<RoomCreateUpdatePage update={false} />} />
						<Route path="/room/:roomCode" element={<Room clearHomePageRoomCode={clearHomePageRoomCode} />} />
					</Routes>
				</Router>
			</div>
		</>
	);
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
