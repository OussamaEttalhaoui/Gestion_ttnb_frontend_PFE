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
  useTheme,
  alpha,
  Chip,
  Divider,
  Alert // Ajout de Alert pour l'erreur
} from "@mui/material";
import fetchWithAuth from "../utils/api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LayersIcon from '@mui/icons-material/Layers';

// Google Maps
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyBNr8O-aDEYJG1OVm4FK_ESZ2IMxvCIFHg";

const containerStyle = {
  width: "100%",
  height: "450px", 
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)", 
};

// Fonction de mappage de couleur pour les résultats (MODIFIÉE)
const getCategoryStyles = (category) => {
    switch (category) {
        case "green":
            // 'green' -> Bien équipée
            return { label: "Bien équipée", color: 'success' };
        case "orange":
            // 'orange' -> Moyennement équipée
            return { label: "Moyennement équipée", color: 'warning' };
        case "red":
            // 'red' -> Mal équipée
            return { label: "Mal équipée", color: 'error' };
        default:
            return { label: "Non Classifié", color: 'default' };
    }
};

export default function SituationMap() {
  const theme = useTheme();

  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState(2000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [alOuidanePolygon, setAlOuidanePolygon] = useState([]);

  // --- Logique inchangée ---
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

  // --- Logique inchangée ---
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
      case "hospital": return "Hôpitaux/Centres";
      case "doctor": return "Cabinets médicaux";
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
  // --- FIN Logique inchangée ---

  const categoryInfo = result ? getCategoryStyles(result.couleur) : {};

  return (
    <Box sx={{ 
        bgcolor: '#f8fafc', // Fond unifié
        minHeight: '100vh',
        p: 4 
    }}>
        <Typography 
            variant="h4" 
            sx={{ 
                fontWeight: 800, 
                mb: 4, 
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            <LayersIcon color="primary" sx={{ fontSize: 36 }} /> Situation Géographique & Classification
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}>
            
            {/* === FORMULAIRE ET RÉSULTATS STATUTAIRES === */}
            <Paper 
                elevation={4} 
                sx={{ p: 3, minWidth: 400, maxWidth: 500, borderRadius: 3, height: 'fit-content' }}
            >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.dark }}>
                    <GpsFixedIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Paramètres de classification
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField 
                        label="Coordonnée X (Lambert)" 
                        type="number" 
                        value={x} 
                        onChange={(e) => setX(e.target.value)} 
                        required 
                        variant="outlined" 
                        size="small"
                    />
                    <TextField 
                        label="Coordonnée Y (Lambert)" 
                        type="number" 
                        value={y} 
                        onChange={(e) => setY(e.target.value)} 
                        required 
                        variant="outlined"
                        size="small"
                    />
                    <TextField 
                        label="Rayon (mètres)" 
                        type="number" 
                        value={rayon} 
                        onChange={(e) => setRayon(e.target.value)} 
                        required 
                        variant="outlined"
                        size="small"
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={loading}
                        size="large"
                        sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Classifier la Zone"}
                    </Button>
                </Box>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                
                {result && (
                    <Box sx={{ mt: 4, borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-start', 
                            mb: 2 
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
                                Résultat de la classification :
                            </Typography>
                            
                            <Chip
                                label={categoryInfo.label}
                                color={categoryInfo.color}
                                sx={{ fontWeight: 'bold', fontSize: '1rem', height: 32 }}
                            />
                        </Box>
                        
                        {/* Indicateurs de présence */}
                        <Box 
                            sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 1 
                            }}
                        >
                            {[
                                { label: 'Centres de santé', value: result.health },
                                { label: 'Établissements d’enseignement', value: result.school },
                                { label: 'Réseaux routiers', value: result.roads },
                                { label: 'Électricité', value: result.electricité },
                                { label: 'Eau', value: result.eau },
                                { label: 'Transports publics', value: result.transport },
                            ].map((item) => (
                                <Typography key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: '0.9rem' }}>
                                    {item.value ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                                    {item.label}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* === CARTE INTERACTIVE === */}
            <Box sx={{ minWidth: 400, maxWidth: 800, flexGrow: 1 }}>
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                    <GoogleMap 
                        mapContainerStyle={containerStyle} 
                        center={center} 
                        zoom={13} 
                        mapTypeId="satellite"
                    >
                        
                        {/* Polygone Al Ouidane toujours visible */}
                        <Polygon
                            paths={alOuidanePolygon}
                            options={{
                                strokeColor: "#0000FF",
                                strokeOpacity: 0.9,
                                strokeWeight: 2,
                                fillColor: alpha(theme.palette.primary.main, 0.4),
                                fillOpacity: 0.4,
                            }}
                        />

                        {/* Marqueur + Cercle (logique inchangée) */}
                        {result && (
                            <>
                                <Marker position={center} />
                                <Circle
                                    center={center}
                                    radius={result.rayon}
                                    options={{
                                        strokeColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
                                        fillOpacity: 0.2,
                                    }}
                                />
                                {/* Markers des écoles, santé et transports */}
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

        {/* === TABLEAUX DE RÉSULTATS DÉTAILLÉS === */}
        {result && result.google_places && (
            <Box sx={{ width: "100%", mt: 4, mb: 4 }}>
                <Divider sx={{ mb: 4 }} />
                
                {/* Centres de santé */}
                {result.google_places.health && Object.values(result.google_places.health).some(data => data.count > 0) && (
                    <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Centres de santé</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(result.google_places.health).map(([type, data]) => data.count > 0 && (
                                    <TableRow key={type}>
                                        <TableCell>{translateHealthType(type)}</TableCell>
                                        <TableCell>{data.count}</TableCell>
                                        <TableCell>
                                            {data.places.map((place) => (
                                                <Typography key={place.name} variant="body2">
                                                    <strong>{place.name}</strong> ({place.lat}, {place.lon})
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
                {result.google_places.schools && Object.values(result.google_places.schools).some(data => data.count > 0) && (
                    <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Établissements d'enseignement</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(result.google_places.schools).map(([type, data]) => data.count > 0 && (
                                    <TableRow key={type}>
                                        <TableCell>{translateSchoolType(type)}</TableCell>
                                        <TableCell>{data.count}</TableCell>
                                        <TableCell>
                                            {data.places.map((place) => (
                                                <Typography key={place.name} variant="body2">
                                                    <strong>{place.name}</strong> ({place.lat}, {place.lon})
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


// import React, { useState, useEffect } from "react";
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
// import proj4 from "proj4";

// // Google Maps
// import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon } from "@react-google-maps/api";

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

//   const [alOuidanePolygon, setAlOuidanePolygon] = useState([]);

//   useEffect(() => {
//     const fetchPolygon = async () => {
//       try {
//         const res = await fetchWithAuth("http://localhost:8036/api/zones/al_ouidane");
//         const data = await res.json();
//         setAlOuidanePolygon(data.polygon); // [{lat, lng}, {lat, lng}, ...]
//       } catch (err) {
//         console.error("Erreur chargement polygone:", err);
//       }
//     };
//     fetchPolygon();
//   }, []);

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
//       case "hospital": return "Hôpitaux";
//       case "doctor": return "Cabinets";
//       default: return type;
//     }
//   };

//   const translateSchoolType = (type) => {
//     switch (type) {
//       case "primary": return "Primaire";
//       case "college": return "Collège";
//       case "lycee": return "Lycée";
//       case "maternelle": return "Maternelle";
//       case "unknown": return "Inconnu";
//       default: return type;
//     }
//   };

//   // Centre initial = premier point du polygone si pas de résultat
//   const center = result ? { lat: result.latitude, lng: result.longitude } : alOuidanePolygon[0];

//   return (
//     <Box sx={{ display: "flex", justifyContent: "center", mt: 6, flexDirection: "column" }}>
//       <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
//         {/* === FORMULAIRE === */}
//         <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }}>
//           <Typography variant="h5" sx={{ mb: 3 }}>Classification d'une zone</Typography>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             <TextField label="Coordonnée X (Lambert)" type="number" value={x} onChange={(e) => setX(e.target.value)} required />
//             <TextField label="Coordonnée Y (Lambert)" type="number" value={y} onChange={(e) => setY(e.target.value)} required />
//             <TextField label="Rayon (mètres)" type="number" value={rayon} onChange={(e) => setRayon(e.target.value)} required />
//             <Button type="submit" variant="contained" color="primary" disabled={loading}>
//               {loading ? <CircularProgress size={24} /> : "Classifier"}
//             </Button>
//           </Box>
//           {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
//           {result && (
//             <Box sx={{ mt: 4 }}>
//               <Typography variant="h6" sx={{ color: result.couleur }}>Catégorie : {result.categorie}</Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Centres de santé : {result.health ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Établissements d’enseignement : {result.school ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Réseaux routiers : {result.roads ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Électricité : {result.electricité ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Eau : {result.eau ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//               <Typography sx={{ display: "flex", alignItems: "center" }}>
//                 Transports publics : {result.transport ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
//               </Typography>
//             </Box>
//           )}
//         </Paper>

//         {/* === CARTE INTERACTIVE === */}
//         <Box sx={{ minWidth: 400, maxWidth: 600 }}>
//           <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
//             <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} mapTypeId="satellite">
              
//               {/* Polygone Al Ouidane toujours visible */}
//               <Polygon
//                 paths={alOuidanePolygon}
//                 options={{
//                   strokeColor: "#0000FF",
//                   strokeOpacity: 0.9,
//                   strokeWeight: 2,
//                   fillColor: "#D3D3D3",
//                   fillOpacity: 0.4,
//                 }}
//               />

//               {/* Marqueur + Cercle */}
//               {result && (
//                 <>
//                   <Marker position={center} />
//                   <Circle
//                     center={center}
//                     radius={result.rayon}
//                     options={{
//                       strokeColor:
//                         result.couleur === "green"
//                           ? "#00FF00"
//                           : result.couleur === "orange"
//                           ? "#FFA500"
//                           : result.couleur === "red"
//                           ? "#FF0000"
//                           : "#0000FF",
//                       strokeOpacity: 0.8,
//                       strokeWeight: 2,
//                       fillColor:
//                         result.couleur === "green"
//                           ? "#00FF00"
//                           : result.couleur === "orange"
//                           ? "#FFA500"
//                           : result.couleur === "red"
//                           ? "#FF0000"
//                           : "#0000FF",
//                       fillOpacity: 0.2,
//                     }}
//                   />
//                   {/* Markers des écoles */}
//                   {result.google_places?.schools &&
//                     Object.values(result.google_places.schools).map((schoolType) =>
//                       schoolType.places.map((place) => (
//                         <Marker
//                           key={place.name}
//                           position={{ lat: place.lat, lng: place.lon }}
//                           label={{
//                             text: "SC",
//                             color: "blue",
//                             fontWeight: "bold"
//                           }}
//                           onClick={() => setSelectedPlace(place)}
//                         />
//                       ))
//                     )}
//                   {/* Markers des centres de santé */}
//                   {result.google_places?.health &&
//                     Object.values(result.google_places.health).map((healthType) =>
//                       healthType.places.map((place) => (
//                         <Marker
//                           key={place.name}
//                           position={{ lat: place.lat, lng: place.lon }}
//                           label={{
//                             text: "H",
//                             color: "white",
//                             fontWeight: "bold"
//                           }}
//                           onClick={() => setSelectedPlace(place)}
//                         />
//                       ))
//                     )}
//                     {/* Markers des transports */}
//                     {result.google_places?.transport &&
//                       result.google_places.transport.map((place) => (
//                         <Marker
//                           key={place.name}
//                           position={{ lat: place.lat, lng: place.lon }}
//                           label={{
//                             text: "A.BUS",
//                             color: "yellow",
//                             fontWeight: "bold"
//                           }}
//                           onClick={() => setSelectedPlace(place)}
//                         />
//                     ))}
//                 </>
//               )}

//               {/* InfoWindow */}
//               {selectedPlace && (
//                 <InfoWindow
//                   position={{ lat: selectedPlace.lat, lng: selectedPlace.lon }}
//                   onCloseClick={() => setSelectedPlace(null)}
//                 >
//                   <div>
//                     <strong>{selectedPlace.name}</strong>
//                     <br />
//                     ({selectedPlace.lat}, {selectedPlace.lon})
//                   </div>
//                 </InfoWindow>
//               )}
//             </GoogleMap>
//           </LoadScript>
//         </Box>
//       </Box>

//       {/* === TABLEAUX === */}
//       {result && result.google_places && (
//         <Box sx={{ width: "100%", mt: 4 }}>
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





