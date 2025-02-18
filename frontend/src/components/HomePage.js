import { Button, ButtonGroup, Grid, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
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
