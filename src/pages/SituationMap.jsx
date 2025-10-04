import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import fetchWithAuth from "../utils/api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import proj4 from "proj4";

// Google Maps
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyBNr8O-aDEYJG1OVm4FK_ESZ2IMxvCIFHg";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px #0002",
};



export default function SituationMap() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState(2000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [alOuidanePolygon, setAlOuidanePolygon] = useState([]);

  useEffect(() => {
    const fetchPolygon = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:8036/api/zones/al_ouidane");
        const data = await res.json();
        setAlOuidanePolygon(data.polygon); // [{lat, lng}, {lat, lng}, ...]
      } catch (err) {
        console.error("Erreur chargement polygone:", err);
      }
    };
    fetchPolygon();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetchWithAuth("http://localhost:8036/api/zones/classifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, rayon }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Erreur lors de la classification");
    }
    setLoading(false);
  };

  const translateHealthType = (type) => {
    switch (type) {
      case "hospital": return "Hôpitaux";
      case "doctor": return "Cabinets";
      default: return type;
    }
  };

  const translateSchoolType = (type) => {
    switch (type) {
      case "primary": return "Primaire";
      case "college": return "Collège";
      case "lycee": return "Lycée";
      case "maternelle": return "Maternelle";
      case "unknown": return "Inconnu";
      default: return type;
    }
  };

  // Centre initial = premier point du polygone si pas de résultat
  const center = result ? { lat: result.latitude, lng: result.longitude } : alOuidanePolygon[0];

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6, flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
        {/* === FORMULAIRE === */}
        <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Classification d'une zone</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Coordonnée X (Lambert)" type="number" value={x} onChange={(e) => setX(e.target.value)} required />
            <TextField label="Coordonnée Y (Lambert)" type="number" value={y} onChange={(e) => setY(e.target.value)} required />
            <TextField label="Rayon (mètres)" type="number" value={rayon} onChange={(e) => setRayon(e.target.value)} required />
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Classifier"}
            </Button>
          </Box>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {result && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: result.couleur }}>Catégorie : {result.categorie}</Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Centres de santé : {result.health ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Établissements d’enseignement : {result.school ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Réseaux routiers : {result.roads ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Électricité : {result.electricité ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Eau : {result.eau ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Transports publics : {result.transport ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* === CARTE INTERACTIVE === */}
        <Box sx={{ minWidth: 400, maxWidth: 600 }}>
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} mapTypeId="satellite">
              
              {/* Polygone Al Ouidane toujours visible */}
              <Polygon
                paths={alOuidanePolygon}
                options={{
                  strokeColor: "#0000FF",
                  strokeOpacity: 0.9,
                  strokeWeight: 2,
                  fillColor: "#D3D3D3",
                  fillOpacity: 0.4,
                }}
              />

              {/* Marqueur + Cercle */}
              {result && (
                <>
                  <Marker position={center} />
                  <Circle
                    center={center}
                    radius={result.rayon}
                    options={{
                      strokeColor:
                        result.couleur === "green"
                          ? "#00FF00"
                          : result.couleur === "orange"
                          ? "#FFA500"
                          : result.couleur === "red"
                          ? "#FF0000"
                          : "#0000FF",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor:
                        result.couleur === "green"
                          ? "#00FF00"
                          : result.couleur === "orange"
                          ? "#FFA500"
                          : result.couleur === "red"
                          ? "#FF0000"
                          : "#0000FF",
                      fillOpacity: 0.2,
                    }}
                  />
                  {/* Markers des écoles */}
                  {result.google_places?.schools &&
                    Object.values(result.google_places.schools).map((schoolType) =>
                      schoolType.places.map((place) => (
                        <Marker
                          key={place.name}
                          position={{ lat: place.lat, lng: place.lon }}
                          label={{
                            text: "SC",
                            color: "blue",
                            fontWeight: "bold"
                          }}
                          onClick={() => setSelectedPlace(place)}
                        />
                      ))
                    )}
                  {/* Markers des centres de santé */}
                  {result.google_places?.health &&
                    Object.values(result.google_places.health).map((healthType) =>
                      healthType.places.map((place) => (
                        <Marker
                          key={place.name}
                          position={{ lat: place.lat, lng: place.lon }}
                          label={{
                            text: "H",
                            color: "white",
                            fontWeight: "bold"
                          }}
                          onClick={() => setSelectedPlace(place)}
                        />
                      ))
                    )}
                    {/* Markers des transports */}
                    {result.google_places?.transport &&
                      result.google_places.transport.map((place) => (
                        <Marker
                          key={place.name}
                          position={{ lat: place.lat, lng: place.lon }}
                          label={{
                            text: "A.BUS",
                            color: "yellow",
                            fontWeight: "bold"
                          }}
                          onClick={() => setSelectedPlace(place)}
                        />
                    ))}
                </>
              )}

              {/* InfoWindow */}
              {selectedPlace && (
                <InfoWindow
                  position={{ lat: selectedPlace.lat, lng: selectedPlace.lon }}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div>
                    <strong>{selectedPlace.name}</strong>
                    <br />
                    ({selectedPlace.lat}, {selectedPlace.lon})
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </Box>
      </Box>

      {/* === TABLEAUX === */}
      {result && result.google_places && (
        <Box sx={{ width: "100%", mt: 4 }}>
          {/* Centres de santé */}
          {result.google_places.health && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ p: 2 }}>Centres de santé</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Liste</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(result.google_places.health).map(([type, data]) => (
                    <TableRow key={type}>
                      <TableCell>{translateHealthType(type)}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>
                        {data.places.map((place) => (
                          <Typography key={place.name}>
                            ({place.lat}, {place.lon}) {place.name}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Établissements scolaires */}
          {result.google_places.schools && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ p: 2 }}>Établissements d'enseignement</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Liste</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(result.google_places.schools).map(([type, data]) => (
                    <TableRow key={type}>
                      <TableCell>{translateSchoolType(type)}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>
                        {data.places.map((place) => (
                          <Typography key={place.name}>
                            ({place.lat}, {place.lon}) {place.name}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}



// import React, { useState } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";
// import fetchWithAuth from "../utils/api";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";

// // Google Maps
// import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from "@react-google-maps/api";

// const GOOGLE_MAPS_API_KEY = "AIzaSyBNr8O-aDEYJG1OVm4FK_ESZ2IMxvCIFHg";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
//   borderRadius: "12px",
//   boxShadow: "0 2px 8px #0002",
// };

// export default function SituationMap() {
//   const [x, setX] = useState("");
//   const [y, setY] = useState("");
//   const [rayon, setRayon] = useState(2000);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedPlace, setSelectedPlace] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setResult(null);
//     try {
//       const res = await fetchWithAuth("http://localhost:8036/api/zones/classifier", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ x, y, rayon }),
//       });
//       if (!res.ok) throw new Error("Erreur serveur");
//       const data = await res.json();
//       setResult(data);
//     } catch (err) {
//       setError("Erreur lors de la classification");
//     }
//     setLoading(false);
//   };

//   const translateHealthType = (type) => {
//     switch (type) {
//       case "hospital":
//         return "Hôpitaux";
//       case "pharmacy":
//         return "Pharmacies";
//       case "doctor":
//         return "Cabinets";
//       default:
//         return type;
//     }
//   };

//   const translateSchoolType = (type) => {
//     switch (type) {
//       case "primary":
//         return "Primaire";
//       case "college":
//         return "Collège";
//       case "lycee":
//         return "Lycée";
//       case "maternelle":
//         return "Maternelle";
//       case "unknown":
//         return "Inconnu";
//       default:
//         return type;
//     }
//   };

//   const center = result ? { lat: result.latitude, lng: result.longitude } : null;

//   return (
//     <Box sx={{ display: "flex", justifyContent: "center", mt: 6, flexDirection: "column" }}>
//       <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
//         {/* === FORMULAIRE === */}
//         <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }}>
//           <Typography variant="h5" sx={{ mb: 3 }}>
//             Classification d'une zone
//           </Typography>
//           <Box
//             component="form"
//             onSubmit={handleSubmit}
//             sx={{ display: "flex", flexDirection: "column", gap: 2 }}
//           >
//             <TextField
//               label="Coordonnée X (Lambert)"
//               type="number"
//               value={x}
//               onChange={(e) => setX(e.target.value)}
//               required
//             />
//             <TextField
//               label="Coordonnée Y (Lambert)"
//               type="number"
//               value={y}
//               onChange={(e) => setY(e.target.value)}
//               required
//             />
//             <TextField
//               label="Rayon (mètres)"
//               type="number"
//               value={rayon}
//               onChange={(e) => setRayon(e.target.value)}
//               required
//             />
//             <Button type="submit" variant="contained" color="primary" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : "Classifier"}
//             </Button>
//           </Box>

//           {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

//           {result && (
//             <Box sx={{ mt: 4 }}>
//               <Typography variant="h6" sx={{ color: result.couleur }}>
//                 Catégorie : {result.categorie}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Centres de santé :{" "}
//                 {result.health ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Établissements d’enseignement :{" "}
//                 {result.school ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Réseaux routiers :{" "}
//                 {result.roads ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Électricité :{" "}
//                 {result.electricité ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Eau : {result.eau ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Transports publics :{" "}
//                 {result.transport ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//             </Box>
//           )}
//         </Paper>

//         {/* === CARTE INTERACTIVE === */}
//         <Box sx={{ minWidth: 400, maxWidth: 600 }}>
//           {center ? (
//             <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
//               <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} mapTypeId="satellite">
//                 {/* Marqueur centre */}
//                 <Marker position={center} />

//                 {/* Cercle */}
//                 <Circle
//                   center={center}
//                   radius={result.rayon}
//                   options={{
//                     strokeColor:
//                       result.couleur === "green"
//                         ? "#00FF00"
//                         : result.couleur === "orange"
//                         ? "#FFA500"
//                         : result.couleur === "red"
//                         ? "#FF0000"
//                         : "#0000FF",
//                     strokeOpacity: 0.8,
//                     strokeWeight: 2,
//                     fillColor:
//                       result.couleur === "green"
//                         ? "#00FF00"
//                         : result.couleur === "orange"
//                         ? "#FFA500"
//                         : result.couleur === "red"
//                         ? "#FF0000"
//                         : "#0000FF",
//                     fillOpacity: 0.2,
//                   }}
//                 />

//                 {/* Markers des écoles */}
//                 {result.google_places?.schools &&
//                   Object.values(result.google_places.schools).map((schoolType) =>
//                     schoolType.places.map((place) => (
//                       <Marker
//                         key={place.name}
//                         position={{ lat: place.lat, lng: place.lon }}
//                         label="S"
//                         onClick={() => setSelectedPlace(place)}
//                       />
//                     ))
//                   )}

//                 {/* Markers des centres de santé */}
//                 {result.google_places?.health &&
//                   Object.values(result.google_places.health).map((healthType) =>
//                     healthType.places.map((place) => (
//                       <Marker
//                         key={place.name}
//                         position={{ lat: place.lat, lng: place.lon }}
//                         label="H"
//                         onClick={() => setSelectedPlace(place)}
//                       />
//                     ))
//                   )}

//                 {/* InfoWindow quand on clique sur un marker */}
//                 {selectedPlace && (
//                   <InfoWindow
//                     position={{ lat: selectedPlace.lat, lng: selectedPlace.lon }}
//                     onCloseClick={() => setSelectedPlace(null)}
//                   >
//                     <div>
//                       <strong>{selectedPlace.name}</strong>
//                       <br />
//                       ({selectedPlace.lat}, {selectedPlace.lon})
//                     </div>
//                   </InfoWindow>
//                 )}
//               </GoogleMap>
//             </LoadScript>
//           ) : (
//             <Typography color="text.secondary" sx={{ textAlign: "center" }}>
//               La carte de la zone s'affichera ici
//             </Typography>
//           )}
//         </Box>
//       </Box>

//       {/* === TABLEAUX === */}
//       {result && result.google_places && (
//         <Box sx={{ width: "100%", mt: 4 }}>
//           {/* Centres de santé */}
//           {result.google_places.health && (
//             <TableContainer component={Paper} sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ p: 2 }}>
//                 Centres de santé
//               </Typography>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Type</TableCell>
//                     <TableCell>Nombre</TableCell>
//                     <TableCell>Liste</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(result.google_places.health).map(([type, data]) => (
//                     <TableRow key={type}>
//                       <TableCell>{translateHealthType(type)}</TableCell>
//                       <TableCell>{data.count}</TableCell>
//                       <TableCell>
//                         {data.places.map((place) => (
//                           <Typography key={place.name}>
//                             ({place.lat}, {place.lon}) {place.name}
//                           </Typography>
//                         ))}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Établissements scolaires */}
//           {result.google_places.schools && (
//             <TableContainer component={Paper} sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ p: 2 }}>
//                 Établissements d'enseignement
//               </Typography>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Type</TableCell>
//                     <TableCell>Nombre</TableCell>
//                     <TableCell>Liste</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(result.google_places.schools).map(([type, data]) => (
//                     <TableRow key={type}>
//                       <TableCell>{translateSchoolType(type)}</TableCell>
//                       <TableCell>{data.count}</TableCell>
//                       <TableCell>
//                         {data.places.map((place) => (
//                           <Typography key={place.name}>
//                             ({place.lat}, {place.lon}) {place.name}
//                           </Typography>
//                         ))}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }


// import React, { useState } from 'react'
// import {
//   Box, Paper, Typography, TextField, Button, CircularProgress,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow
// } from '@mui/material'
// import fetchWithAuth from '../utils/api'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import CancelIcon from '@mui/icons-material/Cancel'

// const GOOGLE_MAPS_API_KEY = "AIzaSyBNr8O-aDEYJG1OVm4FK_ESZ2IMxvCIFHg"

// function getStaticMapUrl(latitude, longitude, rayon, couleur) {
//   const size = "400x400"
//   const maptype = "satellite"

//   const toRad = (deg) => (deg * Math.PI) / 180
//   const toDeg = (rad) => (rad * 180) / Math.PI
//   const earthRadius = 6378137
//   const numPoints = 72
//   const points = []

//   for (let i = 0; i <= numPoints; i++) {
//     const angle = (i * 2 * Math.PI) / numPoints
//     const dx = rayon * Math.cos(angle)
//     const dy = rayon * Math.sin(angle)
//     const dLat = dy / earthRadius
//     const dLng = dx / (earthRadius * Math.cos(toRad(latitude)))
//     points.push(`${latitude + toDeg(dLat)},${longitude + toDeg(dLng)}`)
//   }

//   // Déterminer couleur fill transparente selon la catégorie
//   let fillColor = "0x0000ff40" // bleu semi-transparent par défaut
//   if (couleur === "green") fillColor = "0x00ff0040"
//   else if (couleur === "orange") fillColor = "0xffa50040"
//   else if (couleur === "red") fillColor = "0xff000040"

//   // contour du cercle = même couleur mais plus opaque
//   let strokeColor = fillColor.replace("40", "FF")

//   const center = `${latitude},${longitude}`
//   const marker = `&markers=color:blue|${center}`

//   // Google Maps Static API : path=color:stroke|fillcolor:fill|lat,lng|lat,lng...
//   const path = `&path=color:${strokeColor}|fillcolor:${fillColor}|${points.join("|")}`

//   // Calcul zoom automatique pour que le cercle rentre dans l’image (inchangé)
//   function latRad(lat) {
//     const sin = Math.sin(toRad(lat))
//     const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
//     return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
//   }

//   function zoom(mapPx, worldPx, fraction) {
//     return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
//   }

//   const lats = points.map(p => parseFloat(p.split(",")[0]))
//   const lngs = points.map(p => parseFloat(p.split(",")[1]))
//   const latMin = Math.min(...lats)
//   const latMax = Math.max(...lats)
//   const lngMin = Math.min(...lngs)
//   const lngMax = Math.max(...lngs)

//   const WORLD_DIM = { height: 256, width: 256 }
//   const ZOOM_MAX = 21

//   const latFraction = (latRad(latMax) - latRad(latMin)) / Math.PI
//   const lngDiff = lngMax - lngMin
//   const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

//   const latZoom = zoom(parseInt(size.split("x")[1]), WORLD_DIM.height, latFraction)
//   const lngZoom = zoom(parseInt(size.split("x")[0]), WORLD_DIM.width, lngFraction)
//   const zoomLevel = Math.min(latZoom, lngZoom, ZOOM_MAX)

//   return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoomLevel}&size=${size}${marker}${path}&maptype=${maptype}&key=${GOOGLE_MAPS_API_KEY}`
// }

// export default function SituationMap() {
//   const [x, setX] = useState('')
//   const [y, setY] = useState('')
//   const [rayon, setRayon] = useState(2000)
//   const [result, setResult] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setResult(null)
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/zones/classifier', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ x, y, rayon })
//       })
//       if (!res.ok) throw new Error('Erreur serveur')
//       const data = await res.json()
//       setResult(data)
//     } catch (err) {
//       setError('Erreur lors de la classification')
//     }
//     setLoading(false)
//   }

//   const translateHealthType = (type) => {
//     switch (type) {
//       case 'hospital': return 'Hôpitaux';
//       case 'pharmacy': return 'Pharmacies';
//       case 'doctor': return 'Cabinets';
//       default: return type;
//     }
//   };

//   const translateSchoolType = (type) => {
//     switch (type) {
//       case 'primary': return 'Primaire';
//       case 'college': return 'Collège';
//       case 'lycee': return 'Lycée';
//       case 'maternelle': return 'Maternelle';
//       case 'unknown': return 'Inconnu';
//       default: return type;
//     }
//   };

//   return (
//     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, flexDirection: 'column' }}>
//       <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
//         <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }}>
//           <Typography variant="h5" sx={{ mb: 3 }}>Classification d'une zone</Typography>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <TextField
//               label="Coordonnée X (Lambert)"
//               type="number"
//               value={x}
//               onChange={e => setX(e.target.value)}
//               required
//             />
//             <TextField
//               label="Coordonnée Y (Lambert)"
//               type="number"
//               value={y}
//               onChange={e => setY(e.target.value)}
//               required
//             />
//             <TextField
//               label="Rayon (mètres)"
//               type="number"
//               value={rayon}
//               onChange={e => setRayon(e.target.value)}
//               required
//             />
//             <Button type="submit" variant="contained" color="primary" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : 'Classifier'}
//             </Button>
//           </Box>
//           {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
//           {result && (
//             <Box sx={{ mt: 4 }}>
//               <Typography variant="h6" sx={{ color: result.couleur }}>
//                 Catégorie : {result.categorie}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Centres de santé : {result.health ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Établissements d’enseignement : {result.school ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Réseaux routiers : {result.roads ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Électricité : {result.electricité ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Eau : {result.eau ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: 'flex', alignItems: 'center' }}>
//                 Transports publics : {result.transport ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//             </Box>
//           )}
//         </Paper>
//         <Box sx={{ minWidth: 400, maxWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           {(result && result.latitude && result.longitude) ? (
//             <img
//               src={getStaticMapUrl(result.latitude, result.longitude, result.rayon, result.couleur)}
//               alt="Zone sur la carte"
//               style={{ borderRadius: 12, boxShadow: '0 2px 8px #0002', width: '100%', height: 'auto' }}
//             />
//           ) : (
//             <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
//               La carte de la zone s'affichera ici
//             </Typography>
//           )}
//         </Box>
//       </Box>

//       {/* Tableaux d'informations */}
//       {result && result.google_places && (
//         <Box sx={{ width: '100%', mt: 4 }}>
//           {/* Centres de santé */}
//           {result.google_places.health && (
//             <TableContainer component={Paper} sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ p: 2 }}>Centres de santé</Typography>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Type</TableCell>
//                     <TableCell>Nombre</TableCell>
//                     <TableCell>Liste</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(result.google_places.health).map(([type, data]) => (
//                     <TableRow key={type}>
//                       <TableCell>{translateHealthType(type)}</TableCell>
//                       <TableCell>{data.count}</TableCell>
//                       <TableCell>
//                         {data.places.map(place => (
//                           <Typography key={place.name}>
//                             ({place.lat}, {place.lon}) {place.name}
//                           </Typography>
//                         ))}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Établissements d'enseignement */}
//           {result.google_places.schools && (
//             <TableContainer component={Paper} sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ p: 2 }}>Établissements d'enseignement</Typography>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Type</TableCell>
//                     <TableCell>Nombre</TableCell>
//                     <TableCell>Liste</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(result.google_places.schools).map(([type, data]) => (
//                     <TableRow key={type}>
//                       <TableCell>{translateSchoolType(type)}</TableCell>
//                       <TableCell>{data.count}</TableCell>
//                       <TableCell>
//                         {data.places.map(place => (
//                           <Typography key={place.name}>
//                             ({place.lat}, {place.lon}) {place.name}
//                           </Typography>
//                         ))}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Transports publics */}
//           {result.google_places.transport && (
//             <TableContainer component={Paper} sx={{ mb: 2 }}>
//               <Typography variant="h6" sx={{ p: 2 }}>Transports publics</Typography>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Type</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {result.google_places.transport.map(type => (
//                     <TableRow key={type}>
//                       <TableCell>{type}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </Box>
//       )}
//     </Box>
//   )
// }


