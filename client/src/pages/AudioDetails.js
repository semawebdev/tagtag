import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import StreamAudio from '../components/StreamAudio'


export default function AudioDetails() {
	const [audio, setAudio] = useState(null)

	const { id } = useParams()
	const navigate = useNavigate()

	useEffect(() => {
		const storedToken = localStorage.getItem('authToken')
		axios.get(`/api/audios/${id}`, { headers: { Authorization: `Bearer ${storedToken}` } })
			.then(response => {
				setAudio(response.data)
			})
			.catch(err => console.log(err))
	}, [])

	const deleteAudio = () => {
		const storedToken = localStorage.getItem('authToken')
		axios.delete(`/api/audios/${id}`, { headers: { Authorization: `Bearer ${storedToken}` } })
			.then(() => {
				navigate('/audios')
			})
			.catch(err => console.log(err))
	}

	return (
		<>
			{audio === null ? <h3>Loading...</h3> :
				<>
					<h1>Audio Details</h1>
					<h3>{audio.title}</h3>
					<p>{audio.tags.join(", ")}</p>
					<Link to={`/audios/edit/${audio._id}`}>
						<button className="button">Edit this audio 📝</button>
					</Link>

					<StreamAudio audioID={audio._id} />
					<button className="button" onClick={deleteAudio}>Delete this audio ❌</button>
				</>
			}
		</>
	)
}