import React, { useState, useEffect,useRef } from "react";
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
  Alert 
} from "@mui/material";
import fetchWithAuth from "../utils/api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LayersIcon from '@mui/icons-material/Layers';
import API_BASE_URL from '../utils/apiConfig'
import { Autocomplete } from "@react-google-maps/api";
import useMediaQuery from '@mui/material/useMediaQuery';



// Google Maps
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon, DrawingManager } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


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

  const [isDrawing, setIsDrawing] = useState(false); // Pour activer le dessin
  const [polygonCoords, setPolygonCoords] = useState([]); // Stocke les coordonnées tracées

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >900px 



  // --- Logique inchangée ---
  useEffect(() => {
    const fetchPolygon = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/al_ouidane`);
        const data = await res.json();
        setAlOuidanePolygon(data.polygon); // [{lat, lng}, {lat, lng}, ...]
      } catch (err) {
        console.error("Erreur chargement polygone:", err);
      }
    };
    fetchPolygon();
  }, []);

  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

//   useEffect(() => {
//     if (mapRef.current && alOuidanePolygon.length > 0) {
//       const bounds = new window.google.maps.LatLngBounds();
//       alOuidanePolygon.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
//       mapRef.current.fitBounds(bounds);
//     }
//   }, [alOuidanePolygon, mapRef.current]);
useEffect(() => {
    if (alOuidanePolygon.length > 0 && mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        alOuidanePolygon.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
        mapRef.current.fitBounds(bounds);
        setMapCenter(bounds.getCenter().toJSON()); // met à jour le center pour les markers
    }
}, [alOuidanePolygon, mapLoaded]);


  // --- Logique inchangée ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/classifier`, {
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

  // Centre initial 
  const center = result
    ? { lat: result.latitude, lng: result.longitude }
    : alOuidanePolygon.length > 0
      ? {
          lat: alOuidanePolygon.reduce((sum, p) => sum + p.lat, 0) / alOuidanePolygon.length,
          lng: alOuidanePolygon.reduce((sum, p) => sum + p.lng, 0) / alOuidanePolygon.length
        }
      : { lat: 0, lng: 0 }; // fallback

  // --- FIN Logique inchangée ---

  const categoryInfo = result ? getCategoryStyles(result.couleur) : {};

  const handlePolygonClassification = async (polygon) => {
  setLoading(true);
  setError("");
  setResult(null);

  try {
    console.log("➡️ Polygon envoyé au microservice Python :", polygon);

    const res = await fetch("https://site--zone-classification-api--dvl7b6hjp5rp.code.run/classify_polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polygon: polygon.map(p => ({
          lat: p.lat,  // ⚠️ garde lat en premier
          lng: p.lng
        }))
      }),
    });

    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data = await res.json();

    console.log("✅ Résultat du microservice :", data);
    setResult(data);
  } catch (err) {
    console.error("❌ Erreur classification polygone :", err);
    setError("Erreur lors de la classification par polygone");
  }

  setLoading(false);
};

//   const handlePolygonClassification = async (polygon) => {
//     setLoading(true);
//     setError("");
//     setResult(null);

//     try {
//         console.log("Polygon envoyé au backend :", polygon);
//         const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/classifier_polygon`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ polygon })
//         });


//         if (!res.ok) throw new Error("Erreur serveur");
//         const data = await res.json();
//         console.log(data)
//         setResult(data);
//     } catch (err) {
//         setError("Erreur lors de la classification par polygone");
//     }

//     setLoading(false);
// };


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

        {/* <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 4,
            mb: 4,
          }}
        >
            
            {/* === FORMULAIRE ET RÉSULTATS STATUTAIRES === */}
            <Paper 
                elevation={4} 
                sx={{ p: 3,width: isMobile ? "100%" : 400, maxWidth: 500, borderRadius: 3, height: 'fit-content' }}
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
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => setIsDrawing(!isDrawing)}
                        size="large"
                        sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {isDrawing ? "Annuler le dessin" : "Classifier par Polygone"}
                    </Button>
                    

                </Box>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                
                {result && (
                    <Box sx={{ mt: 4, borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-start', 
                            mb: 2 ,
                            flexDirection: isMobile ? 'column' : 'row', // ← ajoute cette ligne
                            gap: 1 
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: isMobile ? 0 : 2  }}>
                                Résultat de la classification :
                            </Typography>
                            
                            <Chip
                                label={categoryInfo.label}
                                color={categoryInfo.color}
                                sx={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '1rem', 
                                    height: 32,
                                    width: isMobile ? '100%' : 'auto', 
                                    textAlign: 'center'
                                }}
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
             <Box
                sx={{
                width: isMobile ? "100%" : isTablet ? "100%" : "calc(100% - 420px)",
                height: isMobile ? 300 : isTablet ? 400 : 450,
                  borderRadius: 3,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                }}
              >
              {alOuidanePolygon.length === 0 ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                   <CircularProgress />
                 </Box>
               ) : (
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places", "drawing"]}>
                    
                    <GoogleMap
                    //    onLoad={map => (mapRef.current = map)}
                    onLoad={map => {
                        mapRef.current = map;
                        setMapLoaded(true); // indique que la map est prête
                    }}
                       mapContainerStyle={{
                         width: "100%",
                         height: isMobile ? "300px" : "450px",
                       }}
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
   

                        {/* Polygone tracé par l'utilisateur */}
                        {polygonCoords.length > 0 && (
                            <Polygon
                                paths={polygonCoords}
                                options={{
                                    strokeColor: "#FF0000",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 2,
                                    fillColor: alpha(theme.palette.error.main, 0.2),
                                    fillOpacity: 0.4,
                                }}
                            />
                        )}

                        {/* DrawingManager */}
                        {isDrawing && (
                            <DrawingManager
                                onPolygonComplete={(polygon) => {
                                    const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
                                    setPolygonCoords(path);
                                    setIsDrawing(false);
                                    handlePolygonClassification(path); // Appel de la classification par polygone
                              
                                }}
                                options={{
                                    drawingControl: true,
                                    drawingControlOptions: {
                                        position: window.google.maps.ControlPosition.TOP_CENTER,
                                        drawingModes: ['polygon']
                                    },
                                    polygonOptions: {
                                        fillColor: '#FF0000',
                                        fillOpacity: 0.2,
                                        strokeWeight: 2,
                                        clickable: true,
                                        editable: true,
                                        zIndex: 1
                                    }
                                }}
                            />
                        )}


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
                )}
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




